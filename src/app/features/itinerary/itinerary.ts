import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ItineraryItem } from '../../core/api.service';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary.html',
  styleUrl: './itinerary.scss'
})
export class Itinerary implements OnInit {
  private api = inject(ApiService);

  rawItinerary = signal<ItineraryItem[]>([]);
  availableDays = computed(() => {
    const days = new Set(this.rawItinerary().map(i => i.day).filter(d => d.trim() !== ''));
    return Array.from(days).sort();
  });

  selectedDay = signal<string>('');
  expandedItems = signal<Set<number>>(new Set());

  currentItinerary = computed(() => {
    return this.rawItinerary().filter(i => i.day === this.selectedDay());
  });

  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.api.getItinerary().subscribe(data => {
      this.rawItinerary.set(data);
      if (this.availableDays().length > 0) {
        this.selectedDay.set(this.availableDays()[0]);
      }
      this.isLoading.set(false);
    });
  }

  selectDay(day: string) {
    this.selectedDay.set(day);
    this.expandedItems.set(new Set()); // Reset expanded on day change
  }

  toggleExpand(index: number) {
    const current = new Set(this.expandedItems());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.expandedItems.set(current);
  }

  openMap(keyword: string, event: Event) {
    event.stopPropagation();
    if (!keyword) return;
    const isUrl = keyword.startsWith('http://') || keyword.startsWith('https://');
    const url = isUrl ? keyword : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`;
    window.open(url, '_blank');
  }
}
