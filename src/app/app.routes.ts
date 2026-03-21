import { Routes } from '@angular/router';
import { Itinerary } from './features/itinerary/itinerary';
import { Accounting } from './features/accounting/accounting';
import { Weather } from './features/weather/weather';
import { Information } from './features/information/information';

export const routes: Routes = [
  { path: '', redirectTo: 'itinerary', pathMatch: 'full' },
  { path: 'itinerary', component: Itinerary },
  { path: 'accounting', component: Accounting },
  { path: 'weather', component: Weather },
  { path: 'information', component: Information },
];
