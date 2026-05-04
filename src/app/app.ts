import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './services/weather';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  city = '';
  suggestions: any[] = [];

  weather: any = null;
  forecast: any[] = [];
  recommendations: string[] = [];

  history: string[] = [];
  favorites: string[] = [];

  currentUnit: 'C' | 'F' = 'C';
  loading = false;
  errorMessage = '';

  private debounceTimer: any;

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.loadHistory();
    this.loadFavorites();
    this.city = 'Tokyo';
    this.searchWeather();
  }

  async searchWeather(cityName?: string): Promise<void> {
    const searchCity = cityName || this.city.trim();

    if (!searchCity) {
      this.errorMessage = 'Por favor escribe una ciudad.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.suggestions = [];

    try {
      this.weather = await this.weatherService.getWeather(searchCity);

      const forecastResponse = await this.weatherService.getForecast(searchCity);

      this.forecast = forecastResponse.list.filter((item: any) =>
        item.dt_txt.includes('12:00:00')
      );

      this.recommendations = this.getRecommendations(this.weather.weather[0].main);
      this.city = this.weather.name;
      this.saveToHistory(this.weather.name);

    } catch (error: any) {
      console.error(error);
      this.errorMessage = error.message || 'No se pudo consultar el clima.';
    } finally {
      this.loading = false;
    }
  }

  onCityInput(): void {
    clearTimeout(this.debounceTimer);

    const query = this.city.trim();

    if (query.length < 2) {
      this.suggestions = [];
      return;
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        this.suggestions = await this.weatherService.getCitySuggestions(query);
      } catch {
        this.suggestions = [];
      }
    }, 400);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.searchWeather();
  }

  selectSuggestion(suggestion: any): void {
    this.city = suggestion.name;
    this.suggestions = [];
    this.searchWeather(suggestion.name);
  }

  toggleUnit(): void {
    this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
  }

  convertTemp(tempC: number): number {
    if (this.currentUnit === 'C') return tempC;
    return (tempC * 9) / 5 + 32;
  }

  saveFavorite(city: string): void {
    if (!this.favorites.includes(city)) {
      this.favorites.push(city);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
  }

  removeFavorite(city: string, event: Event): void {
    event.stopPropagation();
    this.favorites = this.favorites.filter(item => item !== city);
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  private saveToHistory(city: string): void {
    this.history = this.history.filter(item => item !== city);
    this.history.unshift(city);
    this.history = this.history.slice(0, 5);
    localStorage.setItem('history', JSON.stringify(this.history));
  }

  private loadHistory(): void {
    this.history = JSON.parse(localStorage.getItem('history') || '[]');
  }

  private loadFavorites(): void {
    this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  }

  private isValidCityName(city: string): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(city);
  }

  private getRecommendations(weatherType: string): string[] {
    switch (weatherType) {
      case 'Clear':
        return ['Ideal para ir a la playa', 'Perfecto para caminatas al aire libre', 'Visita parques o miradores'];
      case 'Rain':
        return ['Buen día para visitar museos', 'Explora cafeterías o restaurantes', 'Lleva paraguas'];
      case 'Clouds':
        return ['Clima agradable para recorrer la ciudad', 'Haz un tour cultural o histórico', 'Ideal para tomar fotos'];
      case 'Snow':
        return ['Actividades en nieve', 'Abrígate bien', 'Disfruta bebidas calientes'];
      case 'Thunderstorm':
        return ['Evita actividades al aire libre', 'Quédate en lugares seguros', 'Visita centros cerrados'];
      default:
        return ['Explora lugares turísticos populares', 'Consulta actividades locales', 'Disfruta tu viaje con precaución'];
    }
  }
}