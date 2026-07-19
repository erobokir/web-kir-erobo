export interface DiklatColumn {
  key: string;
  label: string;
}

export interface DiklatRow {
  id: string;
  cells: Record<string, string>;
}

export interface DiklatSheet {
  id: string;
  title: string;
  columns: DiklatColumn[];
  rows: DiklatRow[];
  updated_at: string;
}
