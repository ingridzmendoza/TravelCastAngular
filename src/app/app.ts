import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './services/weather';
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
  filteredCities: string[] = [];

  constructor(private weatherService: WeatherService) {}

  onCityInput() {
    const search = this.city.toLowerCase().trim();

    if (!search) {
      this.filteredCities = [];
      return;
    }

    this.filteredCities = this.recentSearches.filter(city =>
      city.toLowerCase().includes(search)
    );
  }

  selectCity(city: string) {
    this.city = city;
    this.filteredCities = [];
    this.searchWeather();
  }

  searchWeather() {
    if (!this.city.trim()) return;

    this.loading = true;
    this.error = '';
    this.weather = null;
    this.forecast = [];
    this.filteredCities = [];

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
        this.forecast = data.list.filter(
          (_item: any, index: number) => index % 8 === 0
        );
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
      ...this.recentSearches.filter(
        savedCity => savedCity.toLowerCase() !== city.toLowerCase()
      )
    ].slice(0, 5);
  }

  selectRecent(city: string) {
    this.city = city;
    this.filteredCities = [];
    this.searchWeather();
  }
}