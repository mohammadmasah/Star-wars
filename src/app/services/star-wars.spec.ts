import { TestBed } from '@angular/core/testing';

import { StarWars } from './star-wars';

describe('StarWars', () => {
  let service: StarWars;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StarWars);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
