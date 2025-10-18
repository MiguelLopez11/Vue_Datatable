<template>
  <div class="datatable" :class="{ 'datatable--loading': loading }">
    <!-- Header con filtros -->
    <header v-if="showHeader" class="datatable__header">
      <div class="datatable__filters" v-if="showFilters">
        <div class="datatable__search">
          <input
            v-model="filterText"
            type="text"
            :placeholder="searchPlaceholder"
            class="datatable__search-input"
            @input="handleFilter"
            data-testid="search-input"
          />
          <SearchIcon class="datatable__search-icon" />
        </div>
      </div>
      <div class="datatable__items-per-page">
        <select
          v-model="itemsPerPage"
          @change="handleItemsPerPageChange"
          class="datatable__page-select"
          data-testid="page-select"
        >
          <option
            v-for="option in itemsPerPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }} por página
          </option>
        </select>
      </div>

      <slot name="header-actions" />
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="datatable__loading" data-testid="loading">
      <div class="datatable__loading-spinner" />
      <p>Cargando datos...</p>
    </div>

    <!-- Tabla -->
    <div v-else class="datatable__container">
      <div class="datatable__table-wrapper">
        <table class="datatable__table">
          <thead class="datatable__thead">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'datatable__th',
                  { 'datatable__th--sortable': column.sortable },
                  `datatable__th--${column.align || 'left'}`,
                ]"
                :style="{ width: column.width }"
                @click="column.sortable && handleSort(column.key)"
                @keydown.enter="column.sortable && handleSort(column.key)"
                tabindex="0"
                role="button"
                :aria-sort="getAriaSort(column.key)"
              >
                <div class="datatable__th-content">
                  <span class="datatable__th-label">
                    {{ column.label }}
                  </span>
                  <span
                    v-if="column.sortable"
                    class="datatable__sort-indicator"
                  >
                    <span
                      v-if="sortConfig.key === column.key"
                      class="datatable__sort-icon"
                      :class="`datatable__sort-icon--${sortConfig.order}`"
                    >
                      {{ sortConfig.order === "asc" ? "↑" : "↓" }}
                    </span>
                    <span v-else class="datatable__sort-placeholder">↕</span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="datatable__tbody">
            <tr
              v-for="(item, index) in paginatedData"
              :key="getRowKey(item, index)"
              class="datatable__tr"
              :class="{
                'datatable__tr--even': index % 2 === 0,
                'datatable__tr--odd': index % 2 !== 0,
              }"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'datatable__td',
                  `datatable__td--${column.align || 'left'}`,
                ]"
              >
                <slot
                  :name="`column-${column.key}`"
                  :value="item[column.key]"
                  :item="item"
                  :row="item"
                >
                  <span class="datatable__cell-content">
                    {{ item[column.key] }}
                  </span>
                </slot>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="filteredData.length === 0">
              <td :colspan="columns.length" class="datatable__empty">
                <div class="datatable__empty-content">
                  <p class="datatable__empty-text">
                    {{ emptyStateText }}
                  </p>
                  <button
                    v-if="filterText"
                    @click="handleClearFilters"
                    class="datatable__empty-button"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <footer
        v-if="showPagination && filteredData.length > 0"
        class="datatable__footer"
      >
        <div class="datatable__pagination-info">
          Mostrando
          <strong>{{ paginationRange.start }}-{{ paginationRange.end }}</strong>
          de
          <strong>{{ filteredData.length }}</strong>
          registros
        </div>

        <div class="datatable__pagination-controls">
          <button
            @click="goToPreviousPage"
            :disabled="!hasPreviousPage"
            class="datatable__pagination-button datatable__pagination-button--prev"
            :class="{
              'datatable__pagination-button--disabled': !hasPreviousPage,
            }"
            aria-label="Página anterior"
          >
            ‹
          </button>

          <div class="datatable__pagination-pages">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'datatable__pagination-page',
                { 'datatable__pagination-page--active': page === currentPage },
              ]"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToNextPage"
            :disabled="!hasNextPage"
            class="datatable__pagination-button datatable__pagination-button--next"
            :class="{ 'datatable__pagination-button--disabled': !hasNextPage }"
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  useSlots,
  withDefaults,
  defineProps,
  defineEmits,
} from "vue";
import type {
  Column,
  SortConfig,
  PaginationConfig,
  DataTableProps,
} from "@/types/datatable";

// Props con TypeScript
const props = withDefaults(defineProps<DataTableProps>(), {
  showFilters: true,
  showPagination: true,
  initialItemsPerPage: 10,
  loading: false,
});

// Emits
const emit = defineEmits<{
  sort: [config: SortConfig];
  "page-change": [page: number];
}>();

// Slots
const slots = useSlots();

// Reactive state
const filterText = ref<string>("");
const sortConfig = ref<SortConfig>({ key: "", order: "asc" });
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(props.initialItemsPerPage);

// Constants
const itemsPerPageOptions = [10, 25, 50, 100] as const;

// Computed properties
const showHeader = computed(
  () => props.showFilters || !!slots["header-actions"]
);

const filteredData = computed(() => {
  if (!filterText.value) return props.data;

  const searchTerm = filterText.value.toLowerCase();
  return props.data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm)
    )
  );
});

const sortedData = computed(() => {
  if (!sortConfig.value.key) return filteredData.value;
  const key = sortConfig.value.key;

  return [...filteredData.value].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Normalizar null/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortConfig.value.order === "asc" ? 1 : -1;
    if (bValue == null) return sortConfig.value.order === "asc" ? -1 : 1;

    // Comparar como números si ambos son numéricos
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortConfig.value.order === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Comparación de strings (case-insensitive)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    if (aStr < bStr) return sortConfig.value.order === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.value.order === "asc" ? 1 : -1;
    return 0;
  });
});

const totalPages = computed(() =>
  Math.ceil(sortedData.value.length / itemsPerPage.value)
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

const paginationRange = computed(() => ({
  start: (currentPage.value - 1) * itemsPerPage.value + 1,
  end: Math.min(
    currentPage.value * itemsPerPage.value,
    sortedData.value.length
  ),
}));

const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisiblePages = 5;

  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  start = Math.max(1, end - maxVisiblePages + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const searchPlaceholder = computed(
  () => `Buscar en ${props.columns.length} columnas...`
);

const emptyStateText = computed(() =>
  filterText.value ? "No se encontraron resultados" : "No hay datos disponibles"
);

// Methods
const handleSort = (key: string) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.order = sortConfig.value.order === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.order = "asc";
  }

  currentPage.value = 1;
  emit("sort", { ...sortConfig.value });
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handleItemsPerPageChange = () => {
  currentPage.value = 1;
};

const handleClearFilters = () => {
  filterText.value = "";
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    emit("page-change", page);
  }
};

const goToPreviousPage = () => {
  if (hasPreviousPage.value) {
    goToPage(currentPage.value - 1);
  }
};

const goToNextPage = () => {
  if (hasNextPage.value) {
    goToPage(currentPage.value + 1);
  }
};

const getRowKey = (item: any, index: number) => {
  return item.id || `row-${index}`;
};

const getAriaSort = (key: string) => {
  if (sortConfig.value.key !== key) return "none";
  return sortConfig.value.order === "asc" ? "ascending" : "descending";
};

// Watchers
watch(
  () => props.data,
  () => {
    currentPage.value = 1;
    filterText.value = "";
  }
);

watch(
  () => props.initialItemsPerPage,
  (newValue) => {
    itemsPerPage.value = newValue;
  }
);

// Asegurar que currentPage queda dentro de rango cuando cambia el filtrado / itemsPerPage
watch(
  () => [filteredData.value.length, itemsPerPage.value],
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  }
);
</script>

<style scoped>
@import url("../css/DataTable.css");
</style>
