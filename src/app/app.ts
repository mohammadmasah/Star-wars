import { Component, signal } from '@angular/core';
import { StarshipList } from './components/starship-list/starship-list';

@Component({
  selector: 'app-root',
  imports: [StarshipList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('star-wars-fleet');
}
