import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '9fab128bd5e2214d1f292763d3630877';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}`)
      .pipe(catchError(this.handleError));
  }

  getForecast(city: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Ocurrió un error inesperado.';

    if (error.status === 404) {
      message = 'Ciudad no encontrada.';
    } else if (error.status === 0) {
      message = 'No hay conexión o la API no responde.';
    }

    return throwError(() => new Error(message));
  }
}