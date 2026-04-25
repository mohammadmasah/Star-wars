import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Starship } from '../models/starship.model';

@Injectable({
  providedIn: 'root',
})
export class StarWarsService {

  private http = inject(HttpClient);
  private apiUrl = 'https://swapi.py4e.com/api/starships/';

  getStarships(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`);
  }
}