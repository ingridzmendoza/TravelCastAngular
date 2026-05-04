import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiKey = '9fab128bd5e2214d1f292763d3630877';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private readonly failureThreshold = 3;
  private readonly cooldownTime = 10000;

  private failureCount = 0;
  private circuitOpen = false;
  private nextTryTime = 0;

  constructor(private http: HttpClient) {}

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    if (this.circuitOpen) {
      if (Date.now() < this.nextTryTime) {
        throw new Error('Servicio temporalmente pausado. Intenta más tarde.');
      }

      this.circuitOpen = false;
      this.failureCount = 0;
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await firstValueFrom(this.http.get<T>(url));
        this.failureCount = 0;
        return response;
      } catch {
        this.failureCount++;

        if (this.failureCount >= this.failureThreshold) {
          this.circuitOpen = true;
          this.nextTryTime = Date.now() + this.cooldownTime;
          throw new Error('Servicio temporalmente pausado.');
        }

        if (attempt < this.maxRetries) {
          await this.wait(this.retryDelay);
        } else {
          throw new Error('No se pudo conectar después de varios intentos.');
        }
      }
    }

    throw new Error('Error inesperado.');
  }

  getWeather(city: string): Promise<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.fetchWithRetry(url);
  }

  getForecast(city: string): Promise<any> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.fetchWithRetry(url);
  }

  getCitySuggestions(query: string): Promise<any[]> {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.apiKey}`;
    return this.fetchWithRetry<any[]>(url);
  }
}