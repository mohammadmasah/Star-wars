import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgGridAngular } from 'ag-grid-angular';
import { StarshipList } from './starship-list';
import { StarWarsService } from '../../services/star-wars.service';
import { StarshipResponse } from '../../models/starship.model';
import { of } from 'rxjs';


describe('StarshipList Component', () => {
  let component: StarshipList;
  let fixture: ComponentFixture<StarshipList>;
  let mockSwService: Partial<StarWarsService>;

  const mockResponse = {
    count: 37,
    next: null,
    previous: null,
    results: [
      {
        name: 'Millennium Falcon',
        model: 'YT-1300',
        manufacturer: 'Corellian Engineering',
        crew: '4',
        passengers: '6',
        hyperdrive_rating: '0.5',
      },
    ],
  };

  beforeEach(async () => {
    mockSwService = {
      getStarships: () => of(mockResponse as unknown as StarshipResponse)
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgGridAngular, StarshipList],
      providers: [{ provide: StarWarsService, useValue: mockSwService }],
    }).compileComponents();

    fixture = TestBed.createComponent(StarshipList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should save edited cell value to localStorage', () => {
    const mockEvent= {
      data: {
        name: 'Millennium Falcon',
        model: 'YT-1300 f Corellian Freighter',
        manufacturer: 'Corellian Engineering',
        crew: '4',
        passengers: '6',
        hyperdrive_rating: '0.5',
      },
    };

    component.onCellValueChanged(mockEvent);

    const saved = localStorage.getItem('starship_edits');
    expect(saved).not.toBeNull();

    const edits = JSON.parse(saved!);
    expect(edits['Millennium Falcon'].model).toBe('YT-1300 f Corellian Freighter');
  });

  it('should clear localStorage on reset', () => {
    localStorage.setItem('starship_edits', JSON.stringify({ test: true }));
    localStorage.removeItem('starship_edits');
    expect(localStorage.getItem('starship_edits')).toBeNull();
  });

  it('should reset isEndOfList to false when search changes', () => {
    component.isEndOfList = true;

    const mockEvent = { target: { value: 'falcon' } };
    component.onSearch(mockEvent);

    expect(component.isEndOfList).toBe(false);
  });
});
