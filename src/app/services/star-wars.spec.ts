import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StarWarsService } from './star-wars.service';

describe('StarWarsService', () => {
  let service: StarWarsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StarWarsService],
    });
    service = TestBed.inject(StarWarsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch page 1 by default', () => {
    const mockResponse = {
      count: 37,
      next: 'https://swapi.py4e.com/api/starships/?page=2',
      previous: null,
      results: [{ name: 'Millennium Falcon' }],
    };

    service.getStarships().subscribe((response) => {
      expect(response.count).toBe(37);
      expect(response.results.length).toBe(1);
      expect(response.next).toBeTruthy();
    });

    const req = httpMock.expectOne('https://swapi.py4e.com/api/starships/?page=1&search=');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch correct page when paginating', () => {
    const mockPage2 = {
      count: 37,
      next: 'https://swapi.py4e.com/api/starships/?page=3',
      previous: 'https://swapi.py4e.com/api/starships/?page=1',
      results: [{ name: 'Star Destroyer' }],
    };

    service.getStarships(2).subscribe((response) => {
      expect(response.results[0].name).toBe('Star Destroyer');
      expect(response.previous).toBeTruthy();
      expect(response.next).toBeTruthy();
    });

    const req = httpMock.expectOne('https://swapi.py4e.com/api/starships/?page=2&search=');
    req.flush(mockPage2);
  });

  it('should return null for next on last page', () => {
    const mockLastPage = {
      count: 37,
      next: null,
      previous: 'https://swapi.py4e.com/api/starships/?page=3',
      results: [{ name: 'Scimitar' }],
    };

    service.getStarships(4).subscribe((response) => {
      expect(response.next).toBeNull();
    });

    const req = httpMock.expectOne('https://swapi.py4e.com/api/starships/?page=4&search=');
    req.flush(mockLastPage);
  });

  it('should include search query in request URL', () => {
    const mockSearchResponse = {
      count: 1,
      next: null,
      results: [{ name: 'Millennium Falcon' }],
    };

    service.getStarships(1, 'falcon').subscribe((response) => {
      expect(response.results[0].name).toBe('Millennium Falcon');
    });

    const req = httpMock.expectOne('https://swapi.py4e.com/api/starships/?page=1&search=falcon');
    req.flush(mockSearchResponse);
  });
});
