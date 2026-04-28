import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarWarsService } from '../../services/star-wars.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, IDatasource, IGetRowsParams, GridApi } from 'ag-grid-community';
import { timer, forkJoin } from 'rxjs';
import { Starship } from '../../models/starship.model';
import { CellValueChangedEvent } from 'ag-grid-community';
@Component({
  selector: 'app-starship-list',
  imports: [CommonModule, AgGridAngular],
  templateUrl: './starship-list.html',
  styleUrl: './starship-list.css',
})
export class StarshipList {
  private swService = inject(StarWarsService);
  private isFirstTimeEver = true;

  public rowModelType = 'infinite' as const;
  public cacheBlockSize = 10;
  public maxConcurrentDatasourceRequests = 2;
  public infiniteInitialRowCount = 10;
  public blockLoadDebounceMillis = 100;
  showResetModal = false;
  public totalRows = 0;
  public isEndOfList = false;
  private cdr = inject(ChangeDetectorRef);

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

    { field: 'name', headerName: 'Name', flex: 1, headerClass: 'hc-name' },
    { field: 'model', headerName: 'Model', editable: true, flex: 1, headerClass: 'hc-model' },
    {
      field: 'manufacturer',
      headerName: 'Manufacturer',
      editable: true,
      flex: 1,
      headerClass: 'hc-factory',
    },
    { field: 'crew', headerName: 'Crew', editable: true, flex: 1, headerClass: 'hc-users' },
    {
      field: 'passengers',
      headerName: 'Passengers',
      editable: true,
      flex: 1,
      headerClass: 'hc-seat',
    },
    {
      field: 'hyperdrive_rating',
      headerName: 'Hyperdrive Rating',
      editable: true,
      flex: 1,
      headerClass: 'hc-zap',
    },
  ];

  public defaultColDef: ColDef = {
    minWidth: 150,
    resizable: true,
    sortable: true,
    suppressMovable: false,
  };
  private myDataSource!: IDatasource;
  private gridApi!: GridApi;
  searchQuery = '';

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.isEndOfList = false;
    this.searchQuery = target.value;
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

        const shouldShowSpinner = this.isFirstTimeEver && page === 1 && this.searchQuery === '';
        if (shouldShowSpinner) {
          this.gridApi.setGridOption('loading', true);
        }

        const dataRequest$ = this.swService.getStarships(page, this.searchQuery);
        const minDelayTimer$ = timer(0);

        console.log(`Request for page: ${page}`);

        forkJoin([dataRequest$, minDelayTimer$]).subscribe({
          next: ([response]) => {
            this.gridApi.setGridOption('loading', false);
            this.isFirstTimeEver = false;

            this.totalRows = response.count;

            const saveData = localStorage.getItem('starship_edits');
            const edits = saveData ? JSON.parse(saveData) : {};

            const filteredByName = response.results.filter((ship: Starship) => {
              return ship.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });

            const finalResults = filteredByName.map((ship: Starship) => {
              return edits[ship.name] ? { ...ship, ...edits[ship.name] } : ship;
            });
            if (finalResults.length === 0) {
              this.gridApi.showNoRowsOverlay();
            } else {
              this.gridApi.hideOverlay();
            }
            const lastRow = response.next ? -1 : getRowsParams.startRow + finalResults.length;
            const isLastBlock = !response.next;
            const isScrolledToEnd = getRowsParams.startRow > 0;

            if (isLastBlock && isScrolledToEnd && this.totalRows > 0) {
              this.isEndOfList = true;
              this.cdr.detectChanges();
            }

            getRowsParams.successCallback(finalResults, lastRow);
          },
          error: () => {
            this.gridApi.setGridOption('loading', false);
            this.errorMessage = 'Unable to load data. Please check your connection.';
            getRowsParams.failCallback();
          },
        });
      },
    };
    params.api.setGridOption('datasource', this.myDataSource);
  }
  onCellValueChanged(event: CellValueChangedEvent<Starship>) {
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
