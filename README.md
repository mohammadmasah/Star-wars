# Star Wars Fleet Directory

A high-performance Angular 19 application for browsing and managing a directory of Star Wars starships, built with AG Grid, Tailwind CSS, a fully automated CI/CD pipeline and Docker.

---

## Tech Stack

- **Framework:** Angular 19
- **Data Grid:** AG Grid Community v35
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + Angular TestBed
- **Infrastructure:** Docker, GitHub Actions
- **API:** [SWAPI](https://swapi.py4e.com/)

---

## Installation & Running

### Prerequisites

- Node.js v22 or higher
- npm v10 or higher
- Docker (optional)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/mohammadmasah/Star-wars.git
cd Star-wars
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

Navigate to `http://localhost:4200`.

### Running with Docker

```bash
docker build -t star-wars-app .
docker run -p 4200:4200 star-wars-app
```

Or using Docker Compose:

```bash
docker compose up --build
```

Navigate to `http://localhost:4200`.

---

## Technical Implementation

### SWAPI Resource

The **Starships** resource was chosen (`/api/starships/`) because it provides a rich data structure with multiple fields such as model, manufacturer, crew, passengers, and hyperdrive rating — making it ideal for demonstrating a feature-rich data grid with editing, filtering, and infinite scrolling.

### Infinite Scroll & No-Loader Behavior

Infinite scrolling is implemented using **AG Grid's Infinite Row Model**, which fetches data in pages of 10 rows at a time from the SWAPI API.

To ensure a seamless user experience, the loading overlay is only shown on the **very first page load**. All subsequent scroll-triggered fetches happen silently in the background — the user sees no spinner or interruption while new data loads into the grid.

This is achieved by tracking a `isFirstTimeEver` flag in the component:

```typescript
const shouldShowSpinner = this.isFirstTimeEver && page === 1 && this.searchQuery === '';
if (shouldShowSpinner) {
  this.gridApi.setGridOption('loading', true);
}
```

When the last page is reached, a subtle "End of List" banner appears to inform the user that all records have been loaded.

### Editable Columns & Persistence

The following columns are editable directly in the grid:

| Column | Field |
|---|---|
| Model | `model` |
| Manufacturer | `manufacturer` |
| Crew | `crew` |
| Passengers | `passengers` |
| Hyperdrive Rating | `hyperdrive_rating` |

Edits are captured via AG Grid's `cellValueChanged` event and immediately persisted to **localStorage** under the key `starship_edits`. On every data fetch, the app merges the API results with any locally stored edits, ensuring that user modifications survive page refreshes.

A **Reset Data** button is available in the header to clear all local edits and restore the original data.

### Column Resizing

Column resizing is enabled globally via the `defaultColDef` configuration:

```typescript
public defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  minWidth: 150,
};
```

All columns support free drag-to-resize on their edges. Columns use `flex: 1` by default to fill the available grid width proportionally on load.

---

## Trade-offs & Limitations

**Read-only API:** SWAPI is a public read-only API, so server-side persistence is not possible. LocalStorage was chosen as a practical client-side alternative.

**Search is per-page:** The SWAPI search parameter filters results server-side, but pagination offsets are based on unfiltered counts. To maintain performance and consistency, search results are additionally filtered client-side on each fetched page.

**Angular Zone & AG Grid:** AG Grid's `getRows` callback runs outside Angular's change detection zone. To reflect state changes in the UI (such as showing the end-of-list banner), `ChangeDetectorRef.detectChanges()` must be called manually.

---

## Testing

Unit tests are written using **Vitest** with Angular's **TestBed**:

- `star-wars.spec.ts` — Tests for the SWAPI service (pagination logic, search query construction, last page detection)
- `starship-list.spec.ts` — Tests for the grid component (cell editing, localStorage persistence, search reset behavior)

Run all tests:

```bash
npm test
```

---

## CI/CD

GitHub Actions automatically runs tests on every push and pull request to `main`:

```
Install dependencies → Run Tests (ng test) → Build Docker Image
```

The workflow file is located at `.github/workflows/ci.yml`.

---

## Third-Party Packages

| Package | Purpose |
|---|---|
| `ag-grid-angular` / `ag-grid-community` | High-performance data grid with infinite scroll and inline editing |
| `tailwindcss` | Utility-first CSS framework for responsive styling |
| `vitest` | Fast unit test runner integrated with Angular TestBed |
| `zone.js` | Angular's change detection mechanism |

---

## Author

**Mohammad MASAH**  