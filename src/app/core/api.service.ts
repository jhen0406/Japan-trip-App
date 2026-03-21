import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, of, catchError } from 'rxjs';

export interface ItineraryItem {
  day: string;
  time: string;
  location: string;
  description: string;
  mapKeyword: string;
  transport: string;
  duration: string;
  imageUrl?: string;
}

export interface AccountingItem {
  id: string;
  timestamp: string;
  item: string;
  amount: number;
  payer: string;
  payMethod: string;
  location: string;
  taxFree: string;
  imageUrl: string;
  currency: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.googleAppScriptUrl;
  private get isApiConfigured(): boolean {
    return !!this.apiUrl &&
      !this.apiUrl.includes('YOUR_SCRIPT_ID') &&
      this.apiUrl.startsWith('https://script.google.com');
  }

  getItinerary(): Observable<ItineraryItem[]> {
    if (!this.isApiConfigured) {
      console.warn('GAS URL 未設定，使用本地假資料');
      return of([
        {
          day: 'D1', time: '10:00', location: '抵達福岡機場', description: '領行李、換 JR Pass',
          mapKeyword: '福岡機場國際線', transport: '地鐵', duration: '15分',
          imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800'
        },
        {
          day: 'D1', time: '12:00', location: '博多車站吃拉麵', description: '一蘭或博多雙星，記得提早排隊！',
          mapKeyword: '博多車站', transport: '', duration: '',
          imageUrl: 'https://images.unsplash.com/photo-1558980182-01d84814982a?auto=format&fit=crop&q=80&w=800'
        }
      ] as ItineraryItem[]);
    }
    return this.http.get<{status: string, data: any[]}>(this.apiUrl).pipe(
      map(res => {
        if (res?.status === 'success' && res.data) {
          const mapped = res.data.map(item => ({
            day: String(item['日期（第幾天）'] || item['行程天數'] || item['Day'] || item['日期'] || ''),
            time: String(item['時間'] || item['Time'] || ''),
            location: String(item['地點'] || item['Location'] || ''),
            description: String(item['備註'] || item['描述'] || item['Description'] || ''),
            mapKeyword: String(item['地圖搜尋字詞'] || item['地圖關鍵字或連結'] || item['Map'] || ''),
            transport: String(item['交通工具'] || item['交通方式'] || item['Transport'] || ''),
            duration: String(item['交通時間'] || item['預估車程'] || item['Duration'] || ''),
            imageUrl: String(item['照片連結'] || item['圖片'] || item['Image URL'] || '')
          }));
          
          // 強制幫前兩筆行程加入假圖與文字測試
          if (mapped.length >= 2) {
            if (!mapped[0].imageUrl) mapped[0].imageUrl = 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800';
            if (!mapped[0].description) mapped[0].description = '這是一個測試用的詳細景點介紹。實際使用時，只需在試算表輸入介紹即可。福岡機場是通往九洲的門戶。';
            
            if (!mapped[1].imageUrl) mapped[1].imageUrl = 'https://images.unsplash.com/photo-1558980182-01d84814982a?auto=format&fit=crop&q=80&w=800';
            if (!mapped[1].description) mapped[1].description = '博多拉麵非常有名，一定要來一碗道地的豬骨拉麵！先幫你塞假文字測試排版。';
          }

          if (mapped.length > 0 && mapped.some(m => m.day)) {
            return mapped;
          }
        }
        
        // 若完全沒資料，為了使用者體驗與測試，給予含有假照片的資料
        return [
          {
            day: 'D1', time: '10:00', location: '抵達福岡機場', description: '領行李、換 JR Pass', 
            mapKeyword: '福岡機場國際線', transport: '地鐵', duration: '15分',
            imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800'
          },
          {
            day: 'D1', time: '12:00', location: '博多車站吃拉麵', description: '一蘭或博多雙星，記得提早排隊！', 
            mapKeyword: '博多車站', transport: '', duration: '',
            imageUrl: 'https://images.unsplash.com/photo-1558980182-01d84814982a?auto=format&fit=crop&q=80&w=800'
          }
        ];
      }),
      catchError(err => {
        console.error('Error fetching itinerary', err);
        return of([] as ItineraryItem[]);
      })
    );
  }

  getAccounting(): Observable<AccountingItem[]> {
    if (!this.isApiConfigured) {
      console.warn('GAS URL 未設定，回傳空記帳清單');
      return of([] as AccountingItem[]);
    }
    return this.http.get<{status: string, data: any[]}>(`${this.apiUrl}?type=accounting`).pipe(
      map(res => {
        if (res?.status === 'success' && res.data) {
          return res.data.map(item => ({
            id: item['ID'] ? String(item['ID']) : '',
            timestamp: (item['紀錄時間'] || item['記錄時間'] || item['日期'] || item['時間'] || item['Date']) ? String(item['紀錄時間'] || item['記錄時間'] || item['日期'] || item['時間'] || item['Date']) : '',
            item: (item['購買項目'] || item['項目'] || item['Item']) ? String(item['購買項目'] || item['項目'] || item['Item']) : '',
            amount: Number(item['金額'] || item['Amount'] || 0),
            payer: (item['誰付款'] || item['付款人'] || item['Payer']) ? String(item['誰付款'] || item['付款人'] || item['Payer']) : '',
            payMethod: (item['付款方式'] || item['Payment']) ? String(item['付款方式'] || item['Payment']) : '',
            location: (item['購買地點'] || item['地點'] || item['Location']) ? String(item['購買地點'] || item['地點'] || item['Location']) : '',
            taxFree: (item['是否退稅'] || item['免稅']) ? String(item['是否退稅'] || item['免稅']) : '',
            imageUrl: (item['收據/明細照片連結'] || item['照片']) ? String(item['收據/明細照片連結'] || item['照片']) : '',
            currency: item['幣別'] ? String(item['幣別']) : 'JPY',
            category: (item['類別'] || item['分類'] || item['Category']) ? String(item['類別'] || item['分類'] || item['Category']) : ''
          }));
        }
        return [];
      }),
      catchError(err => {
        console.error('Error fetching accounting info', err);
        return of([] as AccountingItem[]);
      })
    );
  }

  postAccounting(data: any): Observable<any> {
    // GAS CORS Post payload
    return this.http.post(this.apiUrl, JSON.stringify(data), {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      }
    });
  }
}
