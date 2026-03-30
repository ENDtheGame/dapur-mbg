<template>
  <header class="bg-white shadow-sm p-4 flex justify-between items-center md:px-8 border-b border-sky-100">
    <button @click="$emit('toggleSidebar')" class="md:hidden p-2 text-sky-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <h2 class="text-md font-bold text-sky-800">{{ pageTitle }}</h2>
    
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold border border-sky-200 text-xs">A</div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
defineEmits(['toggleSidebar']);

// Logika penamaan judul berdasarkan URL
const pageTitle = computed(() => {
  switch (route.path) {
    case '/dashboard': return 'Dashboard';
    case '/kelola-relawan': return 'Data Relawan';
    case '/tambah-relawan': return 'Tambah Relawan';
    case '/jadwal-kerja': return 'Jadwal Kerja';
    case '/rekap-absensi': return 'Rekap Absensi';
    case '/riwayat-absensi': return 'Riwayat Absensi';
    case '/data-gudang': return ' Management Gudang';
    case '/laporan-stok': return 'Laporan Stok';
    case '/resep': return 'Kalkulator porsi';
    case '/distribusi-porsi': return 'Distribusi porsi';
  
    default: return 'SPPG CIGEDUG 2';
  }
});
</script>
