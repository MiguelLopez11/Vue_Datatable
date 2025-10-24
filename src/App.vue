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
        <button @click="addRandomUser" class="add-btn">Agregar usuario</button>
        <button @click="deleteLastUser" class="delete-btn">
          Eliminar último
        </button>
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

// Nuevas funciones: agregar usuario aleatorio y eliminar último
const addRandomUser = () => {
  const firstNames = ["Luis", "Ana", "Sofía", "Diego", "Laura", "Carlos"];
  const lastNames = [
    "Ramos",
    "Ortiz",
    "López",
    "Martínez",
    "Silva",
    "González",
  ];
  const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${fn} ${ln}`;
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(
    Math.random() * 100
  )}@example.com`;
  const status = Math.random() > 0.5 ? "active" : "inactive";
  const role = Math.random() > 0.7 ? "Admin" : "User";

  users.value.push({ id, name, email, status, role });
  refreshData();
};

const deleteLastUser = () => {
  if (users.value.length === 0) return;
  users.value.pop();
  refreshData();
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

/* Estilos base para los botones del header */
.add-btn,
.delete-btn,
.refresh-btn {
  display: inline-block;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #ffffff;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  margin-right: 8px;
}

/* Agregar (verde) */
.add-btn {
  background: linear-gradient(180deg, #38b24a 0%, #2d9e3a 100%);
}
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(46, 139, 87, 0.16);
}
.add-btn:active {
  transform: translateY(0);
  opacity: 0.95;
}

/* Eliminar (rojo) */
.delete-btn {
  background: linear-gradient(180deg, #e04557 0%, #c73340 100%);
}
.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(201, 57, 69, 0.16);
}
.delete-btn:active {
  transform: translateY(0);
  opacity: 0.95;
}

/* Actualizar (azul) */
.refresh-btn {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}
.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.16);
}
.refresh-btn:active {
  transform: translateY(0);
  opacity: 0.95;
}

/* Estados deshabilitados */
.add-btn:disabled,
.delete-btn:disabled,
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Accesibilidad: foco visible */
.add-btn:focus,
.delete-btn:focus,
.refresh-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}
</style>
