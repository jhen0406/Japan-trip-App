import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss'
})
export class BottomNav {
  
  navItems = [
    { label: '行程表', icon: 'map', route: '/itinerary' },
    { label: '記帳', icon: 'receipt_long', route: '/accounting' },
    { label: '天氣', icon: 'partly_cloudy_day', route: '/weather' },
    { label: '資訊', icon: 'travel_explore', route: '/information' },
  ];

}
