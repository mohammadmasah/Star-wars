import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarWarsService } from '../../services/star-wars.service';
import { Starship } from '../../models/starship.model';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';

@Component({
  selector: 'app-starship-list',
  imports: [CommonModule, AgGridAngular],
  templateUrl: './starship-list.html',
  styleUrl: './starship-list.css',
})
export class StarshipList {
  private swService = inject(StarWarsService);

  public rowModelType: 'infinite' = 'infinite';
  public cacheBlockSize = 10;
  public maxConcurrentDatasourceRequests = 1;
  public infiniteInitialRowCount = 10;
  showResetModal = false;

  columnDefs: ColDef[] = [
    {
      headerName: '',
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      pinned: 'left',
      lockPinned: true,
      cellClass: 'bg-gray-50 border-r border-gray-200 text-center',
    },

    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'model', headerName: 'Model', editable: true, flex: 1 },
    { field: 'manufacturer', headerName: 'Manufacturer', editable: true, flex: 1 },
    { field: 'crew', headerName: 'Crew', editable: true, flex: 1 },
    { field: 'passengers', headerName: 'Passengers', editable: true, flex: 1 },
    { field: 'hyperdrive_rating', headerName: 'Hyperdrive Rating', editable: true, flex: 1 },
  ];

  public defaultColDef: ColDef = {
    minWidth: 150,
    resizable: true,
    sortable: true,
    suppressMovable: false,
  };

  onGridReady(params: GridReadyEvent): void {
    const myDataSource: IDatasource = {
      getRows: (getRowsParams: IGetRowsParams) => {
        const page = Math.floor(getRowsParams.startRow / 10) + 1;
        console.log(`Request for page: ${page}`);

        this.swService.getStarships(page).subscribe({
          next: (response) => {
            const saveData = localStorage.getItem('starship_edits');
            const edits = saveData ? JSON.parse(saveData) : {};

            const finalResults = response.results.map((ship: any) => {
              if (edits[ship.name]) {
                return { ...ship, ...edits[ship.name] };
              }
              return ship;
            });
            const lastRow = response.next ? -1 : response.count;

            getRowsParams.successCallback(finalResults, lastRow);
          },
          error: (error) => {
            console.error('error', error);
            getRowsParams.failCallback();
          },
        });
      },
    };
    params.api.setGridOption('datasource', myDataSource);
  }
  onCellValueChanged(event: any) {
    const saveData = localStorage.getItem('starship_edits');
    const edits = saveData ? JSON.parse(saveData) : {};

    edits[event.data.name] = event.data;

    localStorage.setItem('starship_edits', JSON.stringify(edits));
    console.log('Changes recorded in LocalStorage.');
  }

  openResetModal(): void {
    this.showResetModal = true;
  }
  closeModal(): void {
    this.showResetModal = false;
  }
  confirmReset(): void {
    localStorage.removeItem('starship_edits');
    window.location.reload();
  }
}
