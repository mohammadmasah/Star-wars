import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarWarsService } from '../../services/star-wars.service';
import { Starship } from '../../models/starship.model';

@Component({
  selector: 'app-starship-list',
  imports: [CommonModule],
  templateUrl: './starship-list.html',
  styleUrl: './starship-list.css',
})
export class StarshipList implements OnInit{
  private swService = inject(StarWarsService);

  starships = signal <Starship[]>([]);

  ngOnInit(): void {
    this.swService.getStarships().subscribe({
      next: (data) => {
        this.starships.set(data);
        console.log('Data received successfully:', this.starships);
      },
      error: (error) => console.error('error', error)
    });
  }
}
