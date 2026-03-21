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
    { label: 'Explore', icon: 'explore', route: '/itinerary' },
    { label: 'Plan', icon: 'analytics', route: '/accounting' },
    { label: 'Weather', icon: 'cloud', route: '/weather' },
    { label: 'Saved', icon: 'favorite', route: '/information' },
  ];

}
