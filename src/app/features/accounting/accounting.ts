import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef, effect, afterNextRender } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AccountingItem } from '../../core/api.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounting.html',
  styleUrl: './accounting.scss'
})
export class Accounting implements OnInit {
  private api = inject(ApiService);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  // Form State
  formData = {
    amount: null as number | null,
    currency: 'JPY',
    category: '餐食',
    item: '',
    payer: '蓁',
    payMethod: '現金',
    payMethodDetail: '',
    location: '',
    taxFree: false,
    imageBase64: '',
    imageName: '',
    recordDate: ''
  };

  categories = ['藥妝', '餐食', '伴手禮', '服飾', '生活雜物', '交通', '住宿', '其他'];
  payers = ['蓁', '連', '淇', '議'];
  payMethods = ['現金', '信用卡', '電子支付'];

  isSubmitting = signal(false);
  submitSuccess = signal(false);

  // History State
  history = signal<AccountingItem[]>([]);
  isLoadingHistory = signal(true);

  // View Mode: 'form' | 'history' | 'stats'
  currentView = signal<'form'|'history'|'stats'>('form');

  // Stats State
  statsMode = signal<'time' | 'payer' | 'payMethod' | 'category'>('category');
  chartInstance: any = null;
  statsDetails = signal<{label:string, amount:number, color:string, percent:number, items:AccountingItem[]}[]>([]);

  totalAmountJpy = computed(() => {
    return this.history().filter(h => h.currency === 'JPY').reduce((sum, item) => sum + item.amount, 0);
  });
  totalAmountTwd = computed(() => {
    const twdRecords = this.history().filter(h => h.currency === 'TWD').reduce((sum, item) => sum + item.amount, 0);
    const convertedJpy = this.totalAmountJpy() * 0.21;
    return Math.round(twdRecords + convertedJpy);
  });

  constructor() {
    effect(() => {
      const view = this.currentView();
      const mode = this.statsMode();
      const hw = this.history();
      
      if (view === 'stats') {
        setTimeout(() => this.renderChart(), 50);
      }
    });
  }

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.isLoadingHistory.set(true);
    this.api.getAccounting().subscribe(data => {
      const sorted = data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.history.set(sorted);
      this.isLoadingHistory.set(false);
    });
  }

  // ==============
  // Form Methods
  // ==============
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.formData.imageName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.formData.imageBase64 = '';
    this.formData.imageName = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  submitForm() {
    this.isSubmitting.set(true);
    let finalPayMethod = this.formData.payMethod;
    if (finalPayMethod !== '現金' && this.formData.payMethodDetail) {
      finalPayMethod += ` (${this.formData.payMethodDetail})`;
    }

    const payload = {
      ...this.formData,
      payMethod: finalPayMethod
    };

    this.api.postAccounting(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        setTimeout(() => this.submitSuccess.set(false), 3000);
        this.resetForm();
        this.fetchHistory();
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('儲存失敗，請檢查網路或是設定檔是否正確。');
      }
    });
  }

  resetForm() {
    this.formData = {
      amount: null,
      currency: 'JPY',
      category: '餐食',
      item: '',
      payer: '蓁',
      payMethod: '現金',
      payMethodDetail: '',
      location: '',
      taxFree: false,
      imageBase64: '',
      imageName: '',
      recordDate: ''
    };
  }

  // ==============
  // Stats Methods
  // ==============
  // SVGSlices computation for the pure SVG Donut chart
  svgSlices = computed(() => {
    const details = this.statsDetails();
    if (!details.length) return [];
    
    let offset = 0;
    return details.map(d => {
      // Donut circumference is 100
      const segmentPercent = d.percent;
      // dasharray: slice remaining
      const dashArray = `${segmentPercent} ${100 - segmentPercent}`;
      const dashOffset = -offset;
      offset += segmentPercent;
      
      return {
        ...d,
        dashArray,
        dashOffset
      };
    });
  });

  renderChart() {
    // With pure SVG Donut chart, we don't need ChartJS.
    // So we just compute statsDetails!
    const data = this.history();
    const items = data.filter(d => !!d.amount && !isNaN(d.amount));

    let labels: string[] = [];
    let chartData: number[] = [];
    const groupItemsMap: Record<string, AccountingItem[]> = {};

    if (this.statsMode() === 'time') {
      const groups: Record<string, number> = {};
      items.forEach(it => {
        let dateStr = it.timestamp ? it.timestamp.trim().split(/[\sT]/)[0] : '未知';
        if (!dateStr) dateStr = '未知';
        dateStr = dateStr.replace(/^\d{4}[\/\-]/, '');
        groups[dateStr] = (groups[dateStr] || 0) + it.amount;
        if (!groupItemsMap[dateStr]) groupItemsMap[dateStr] = [];
        groupItemsMap[dateStr].push(it);
      });
      labels = Object.keys(groups).sort();
      chartData = labels.map(d => groups[d]);
    } else {
      const groups: Record<string, number> = {};
      const mapKey = (it: AccountingItem) => {
        if (this.statsMode() === 'category') return it.category || '未分類';
        if (this.statsMode() === 'payer') return it.payer || '未知';
        if (this.statsMode() === 'payMethod') return it.payMethod?.split(' (')[0] || '未知';
        return '其他';
      };

      items.forEach(it => {
        const k = mapKey(it);
        groups[k] = (groups[k] || 0) + it.amount;
        if (!groupItemsMap[k]) groupItemsMap[k] = [];
        groupItemsMap[k].push(it);
      });

      labels = Object.keys(groups);
      chartData = Object.values(groups);
    }

    const bgColors = ['#E79796', '#FFC988', '#C6C09C', '#FFB284', '#F5CEC7', '#8b502a', '#7b431f'];
    const totalSum = chartData.reduce((a,b)=>a+b, 0);
    const details = labels.map((lbl, i) => {
      const amount = chartData[i];
      const percent = totalSum > 0 ? (amount / totalSum) * 100 : 0;
      return { 
        label: lbl, 
        amount, 
        color: bgColors[i % bgColors.length], 
        percent,
        items: groupItemsMap[lbl] || []
      };
    });
    
    if (this.statsMode() !== 'time') {
      details.sort((a,b) => b.amount - a.amount);
    }
    
    // Distribute percentages exactly to equal 100 for the SVG math
    if (details.length > 0 && totalSum > 0) {
      let accumulatedPercent = 0;
      details.forEach((d, i) => {
        d.percent = Math.round(d.percent); // Display rounding
        if (i === details.length - 1) {
          // Adjust last item to ensure total is exactly 100% for the pure SVG dash array
          const totalBefore = details.slice(0, -1).reduce((sum, item) => sum + item.percent, 0);
          d.percent = Math.max(0, 100 - totalBefore);
        }
      });
    }

    this.statsDetails.set(details);
  }
}
