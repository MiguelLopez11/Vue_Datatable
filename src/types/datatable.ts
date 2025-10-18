export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface SortConfig {
  key: string;
  order: "asc" | "desc";
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface DataTableProps {
  data: any[];
  columns: Column[];
  showFilters?: boolean;
  showPagination?: boolean;
  initialItemsPerPage?: number;
  loading?: boolean;
}

export interface DataTableEmits {
  (e: "sort", config: SortConfig): void;
  (e: "page-change", page: number): void;
}
