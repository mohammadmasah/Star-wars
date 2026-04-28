import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StarshipResponse } from '../models/starship.model';
@Injectable({
  providedIn: 'root',
})
export class StarWarsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://swapi.py4e.com/api/starships/';

  getStarships(page = 1, search = ''): Observable<StarshipResponse> {
    const url = `${this.apiUrl}?page=${page}&search=${search}`;
    return this.http.get<StarshipResponse>(url);
  }
}
