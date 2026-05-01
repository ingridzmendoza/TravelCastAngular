import { Component } from '@angular/core';
import { WeatherService } from './services/weather';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KelvinToCelsiusPipe } from './pipes/kelvin-to-celsius-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, KelvinToCelsiusPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  city = '';
  weather: any = null;
  forecast: any[] = [];
  loading = false;
  error = '';
  recentSearches: string[] = [];

  constructor(private weatherService: WeatherService) {}

  searchWeather() {
    if (!this.city.trim()) return;

    this.loading = true;
    this.error = '';
    this.weather = null;
    this.forecast = [];

    const cityName = this.city.trim();

    this.weatherService.getCurrentWeather(cityName).subscribe({
      next: data => {
        this.weather = data;
        this.saveSearch(cityName);
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
      }
    });

    this.weatherService.getForecast(cityName).subscribe({
      next: data => {
        this.forecast = data.list.filter((item: any, index: number) => index % 8 === 0);
        this.loading = false;
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  saveSearch(city: string) {
    this.recentSearches = [
      city,
      ...this.recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase())
    ].slice(0, 5);
  }

  selectRecent(city: string) {
    this.city = city;
    this.searchWeather();
  }
}