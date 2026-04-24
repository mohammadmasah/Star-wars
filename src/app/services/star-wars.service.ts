import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Starship } from '../models/starship.model';

@Injectable({
  providedIn: 'root',
})
export class StarWarsService {

  private http = inject(HttpClient);
  private apiUrl = 'https://swapi.info/api/starships';

  getStarships(): Observable<Starship[]> {
    return this.http.get<Starship[]>(this.apiUrl);
  }
}