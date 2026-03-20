<template>
  <div class="flex min-h-screen bg-slate-50">
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Navbar @toggleSidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
        <router-view></router-view>
      </main>
      
      <footer class="p-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        &copy; 2026 SPPG CIGEDUG 2 - Yayasan Beti Sintawati
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import Navbar from '../components/Navbar.vue';

const isSidebarOpen = ref(false);
</script>


