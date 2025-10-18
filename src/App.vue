<template>
  <div class="app-container">
    <DataTable
      :data="users"
      :columns="columns"
      :loading="loading"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #header-actions>
        <button @click="refreshData" class="refresh-btn">Actualizar</button>
      </template>

      <template #column-email="{ value }">
        <a :href="`mailto:${value}`" class="email-link">
          {{ value }}
        </a>
      </template>

      <template #column-status="{ value }">
        <span :class="`status-badge status-${value}`">
          {{ value }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DataTable from "@/components/DataTable.vue";
import type { Column, SortConfig } from "@/types/datatable";

const loading = ref(false);

const users = ref([
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@email.com",
    status: "active",
    role: "Admin",
  },
  {
    id: 2,
    name: "María García",
    email: "maria@email.com",
    status: "inactive",
    role: "User",
  },
  // ... más datos
]);

const columns: Column[] = [
  { key: "name", label: "Nombre", sortable: true, width: "200px" },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Rol", sortable: true, align: "center" },
  { key: "status", label: "Estado", sortable: true, align: "center" },
];

const handleSort = (config: SortConfig) => {
  console.log("Ordenar por:", config);
};

const handlePageChange = (page: number) => {
  console.log("Cambiar a página:", page);
};

const refreshData = () => {
  loading.value = true;
  // Simular carga
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
</script>
<style>
.app-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  width: 75%;
  margin: auto;
  height: 100vh; /* corregido */
}
</style>
