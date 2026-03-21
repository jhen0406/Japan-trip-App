import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  advice: string;
}

interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

interface ForecastData {
  city: string;
  days: ForecastDay[];
}

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather.html',
  styleUrl: './weather.scss'
})
export class Weather implements OnInit {
  private http = inject(HttpClient);
  
  // Using environment variable for API Key
  private apiKey = environment.openWeatherApiKey;
  
  cities = [
    { name: '熊本', query: 'Kumamoto,JP' },
    { name: '福岡', query: 'Fukuoka,JP' }
  ];

  currentTab = signal<'instant' | 'forecast'>('instant');

  weatherList = signal<WeatherData[]>([]);
  forecastList = signal<ForecastData[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchWeather();
  }

  fetchWeather() {
    let completed = 0;
    const currentResults: WeatherData[] = [];
    const forecastResults: ForecastData[] = [];

    if (!this.apiKey || this.apiKey.includes('YOUR_OWM')) {
      this.loadMock();
      return;
    }

    this.cities.forEach((city, index) => {
      // 1. Fetch current weather
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city.query}&appid=${this.apiKey}&units=metric&lang=zh_tw`;
      this.http.get<any>(currentUrl).pipe(
        catchError(err => {
          console.warn(`Failed to fetch current weather for ${city.name}, using mock.`);
          return of(null);
        })
      ).subscribe(res => {
        if (res) {
          currentResults[index] = {
            city: city.name,
            temp: Math.round(res.main.temp),
            feelsLike: Math.round(res.main.feels_like),
            description: res.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${res.weather[0].icon}@4x.png`,
            humidity: res.main.humidity,
            advice: this.getDressingAdvice(res.main.temp)
          };
        } else {
          currentResults[index] = this.getMockData(city.name);
        }
        this.checkCompleted(++completed, this.cities.length * 2, currentResults, forecastResults);
      });

      // 2. Fetch 5-day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city.query}&appid=${this.apiKey}&units=metric&lang=zh_tw`;
      this.http.get<any>(forecastUrl).pipe(
        catchError(err => {
          console.warn(`Failed to fetch forecast for ${city.name}, using mock.`);
          return of(null);
        })
      ).subscribe(res => {
        if (res && res.list) {
          // Process 5-day forecast (group by day)
          const daysMap = new Map<string, any[]>();
          res.list.forEach((item: any) => {
            const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
            if (!daysMap.has(dateStr)) {
              daysMap.set(dateStr, []);
            }
            daysMap.get(dateStr)!.push(item);
          });
          
          const days: ForecastDay[] = [];
          daysMap.forEach((items, dateStr) => {
            if (days.length >= 5) return; // Only 5 days
            const minTemp = Math.min(...items.map(i => i.main.temp_min));
            const maxTemp = Math.max(...items.map(i => i.main.temp_max));
            // Get the noon or middle item for icon/desc
            const midItem = items[Math.floor(items.length / 2)];
            
            // Format date string to MM/DD
            const [, month, day] = dateStr.split('-');
            
            days.push({
              date: `${month}/${day}`,
              tempMin: Math.round(minTemp),
              tempMax: Math.round(maxTemp),
              description: midItem.weather[0].description,
              icon: `https://openweathermap.org/img/wn/${midItem.weather[0].icon}.png`
            });
          });
          
          forecastResults[index] = { city: city.name, days };
        } else {
          forecastResults[index] = this.getMockForecast(city.name);
        }
        this.checkCompleted(++completed, this.cities.length * 2, currentResults, forecastResults);
      });
    });
  }

  private checkCompleted(completed: number, total: number, currentResults: any[], forecastResults: any[]) {
    if (completed === total) {
      this.weatherList.set(currentResults);
      this.forecastList.set(forecastResults);
      this.isLoading.set(false);
    }
  }

  getDressingAdvice(temp: number): string {
    if (temp >= 25) return '天氣炎熱，建議穿著短袖短褲並注意防曬 ☀️';
    if (temp >= 20) return '氣候舒適，建議穿著短袖或薄長袖 👕';
    if (temp >= 15) return '稍有涼意，建議攜帶薄外套或長袖上衣 🧥';
    if (temp >= 10) return '需穿戴毛帽與厚外套 🧣';
    return '天氣非常寒冷，請準備發熱衣、羽絨衣與毛帽 🧤';
  }

  loadMock() {
    this.weatherList.set([
      this.getMockData('熊本', 14, '04d', '多雲'),
      this.getMockData('福岡', 12, '09d', '小雨')
    ]);
    this.forecastList.set([
      this.getMockForecast('熊本'),
      this.getMockForecast('福岡')
    ]);
    this.isLoading.set(false);
  }

  getMockData(cityName: string, defaultTemp: number = 18, icon: string = '02d', desc: string = '晴時多雲'): WeatherData {
    return {
      city: cityName,
      temp: defaultTemp,
      feelsLike: defaultTemp - 2,
      description: desc,
      icon: `https://openweathermap.org/img/wn/${icon}@4x.png`,
      humidity: 65,
      advice: this.getDressingAdvice(defaultTemp)
    };
  }

  getMockForecast(cityName: string): ForecastData {
    const today = new Date();
    const days: ForecastDay[] = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      days.push({
        date: `${month}/${date}`,
        tempMin: 12 + Math.floor(Math.random() * 5),
        tempMax: 18 + Math.floor(Math.random() * 5),
        description: Math.random() > 0.5 ? '多雲' : '晴時多雲',
        icon: Math.random() > 0.5 ? 'https://openweathermap.org/img/wn/04d.png' : 'https://openweathermap.org/img/wn/02d.png'
      });
    }
    return { city: cityName, days };
  }
}
