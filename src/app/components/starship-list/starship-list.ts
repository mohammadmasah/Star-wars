import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarWarsService } from '../../services/star-wars.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { timer, forkJoin } from 'rxjs';


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

  errorMessage: string | null = null;

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

    { field: 'name', headerName: 'Name', flex: 1, headerClass: 'hc-name'},
    { field: 'model', headerName: 'Model', editable: true, flex: 1, headerClass: 'hc-model'},
    { field: 'manufacturer', headerName: 'Manufacturer', editable: true, flex: 1, headerClass: 'hc-factory'},
    { field: 'crew', headerName: 'Crew', editable: true, flex: 1, headerClass: 'hc-users' },
    { field: 'passengers', headerName: 'Passengers', editable: true, flex: 1, headerClass: 'hc-seat'},
    { field: 'hyperdrive_rating', headerName: 'Hyperdrive Rating', editable: true, flex: 1, headerClass: 'hc-zap'},
  ];

  public defaultColDef: ColDef = {
    minWidth: 150,
    resizable: true,
    sortable: true,
    suppressMovable: false,
  };
  private myDataSource!: IDatasource;
  private gridApi!: any;
  searchQuery: string = '';

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    if (this.gridApi) {
      this.gridApi.setGridOption('datasource', this.myDataSource);
    }
  }
  retryLoad(): void {
    this.errorMessage = null;
    if (this.gridApi) {
      this.gridApi.setGridOption('datasource', this.myDataSource);
    }
  }
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;

    this.gridApi.setGridOption(
      'overlayLoadingTemplate',
      `<div class="custom-loader">
        <div class="spinner"></div>
        <span class="loading-text">Connecting to Imperial Database...</span>
      </div>`,
    );
    this.gridApi.setGridOption('loading', true);

    this.myDataSource = {
      getRows: (getRowsParams: IGetRowsParams) => {
        const page = Math.floor(getRowsParams.startRow / 10) + 1;

        this.gridApi.setGridOption('loading', true);

        const dataRequest$ = this.swService.getStarships(page, this.searchQuery);
        const minDelayTimer$ = timer(0);

        console.log(`Request for page: ${page}`);

        forkJoin([dataRequest$, minDelayTimer$]).subscribe({
          next: ([response, _]) => {
            this.gridApi.setGridOption('loading', false);

            const saveData = localStorage.getItem('starship_edits');
            const edits = saveData ? JSON.parse(saveData) : {};

            const filteredByName = response.results.filter((ship: any) => {
              return ship.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });

            const finalResults = filteredByName.map((ship: any) => {
              return edits[ship.name] ? { ...ship, ...edits[ship.name] } : ship;
            });
            if (finalResults.length === 0) {
              this.gridApi.showNoRowsOverlay();
            } else {
              this.gridApi.hideOverlay();
            }
            const lastRow = response.next ? -1 : response.count;

            getRowsParams.successCallback(finalResults, lastRow);
          },
          error: (error) => {
            this.gridApi.setGridOption('loading', false);
            this.errorMessage = 'Unable to load data. Please check your connection.';
            getRowsParams.failCallback();
          },
        });
      },
    };
    params.api.setGridOption('datasource', this.myDataSource);
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
