import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface InfoSection {
  title: string;
  icon: string;
  isOpen: boolean;
  contentHtml: string;
}

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './information.html',
  styleUrl: './information.scss'
})
export class Information {
  
  sections = signal<InfoSection[]>([
    {
      title: '行李相關規定',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      isOpen: false,
      contentHtml: `
        <ul class="list-disc pl-5 space-y-2 text-sm text-slate-600">
          <li><strong>隨身行李：</strong><br>一般限制為一件手提行李＋一件隨身物品，總重不超過 7 kg。</li>
          <li><strong>託運行李：</strong><br>依您的艙等通常可帶 1~2 件，每件 23 kg。</li>
          <li><strong class="text-red-500">電池規範：</strong><br>行動電源、鋰電池「必須」放在隨身行李（不可託運）。</li>
          <li><strong>液體限制：</strong><br>隨身攜帶液體單瓶不可超過 100ml，且需裝在 1L 夾鏈袋。託運無嚴格單瓶大小限制。</li>
        </ul>
      `
    },
    {
      title: '出入境與 VJW 指南',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      isOpen: false,
      contentHtml: `
        <p class="text-sm text-slate-600 mb-3">入境日本建議預先填寫 <strong>Visit Japan Web (VJW)</strong>，大幅節省通關時間！</p>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-slate-600">
          <li>前往 Visit Japan Web 官網註冊帳號。</li>
          <li>填寫本人資料與同行家人資料。</li>
          <li>登記航班資訊與日本住宿地址（建議事先存於記事本）。</li>
          <li>填具「外國人入境紀錄」及「海關申報」。</li>
          <li>取得 QR Code 後，強烈建議<strong>先截圖</strong>存於手機相簿，以免臨時無網路。</li>
        </ol>
      `
    },
    {
      title: '博多車站地圖指引',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      isOpen: false,
      contentHtml: `
        <p class="text-sm text-slate-600 mb-3">博多車站為九州最大轉乘車站，佔地廣大。以下分為 1 樓與地下街地圖：</p>
        <div class="flex flex-col gap-3">
          <img src="/博多車站地圖1.png" alt="博多車站地圖 1" class="w-full rounded-xl border border-slate-200 shadow-sm" />
          <img src="/博多車站地圖2.png" alt="博多車站地圖 2" class="w-full rounded-xl border border-slate-200 shadow-sm" />
        </div>
      `
    }
  ]);

  toggleSection(index: number) {
    this.sections.update(list => {
      // If we want only one to be open at a time (accordion style)
      return list.map((sec, i) => {
        if (i === index) return { ...sec, isOpen: !sec.isOpen };
        return { ...sec, isOpen: false };
      });
    });
  }
}
