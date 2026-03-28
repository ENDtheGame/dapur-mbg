<template>
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black/20 z-40 md:hidden"
  ></div>

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 md:relative md:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="p-6 flex items-center gap-3">
      <img :src="logoUrl" alt="Logo SPPG" class="w-10 h-10 object-contain" />
      <div>
        <h2 class="font-bold text-slate-800 leading-tight">SPPG CIGEDUG 2</h2>
        <p
          class="text-[10px] font-semibold text-sky-600 tracking-wider uppercase mt-0.5"
        >
          Yayasan Beti Sintawati
        </p>
      </div>
    </div>

    <div class="px-6">
      <div class="border-b border-slate-100"></div>
    </div>

    <nav class="mt-4 px-4 space-y-1">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        @click="$emit('close')"
        class="flex items-center gap-3 p-3 rounded-xl transition-all font-medium"
        :class="
          $route.path === item.path
            ? 'bg-sky-50 text-sky-700'
            : 'text-slate-500 hover:bg-slate-50'
        "
      >
        <component :is="item.icon" :size="20" />
        {{ item.name }}
      </router-link>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-red-500 hover:bg-red-50 mt-4"
      >
        <LogOut :size="20" />
        Keluar
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router"; // Tambahkan ini
import { supabase } from "../lib/supabaseClient"; // Tambahkan ini
import {
  LayoutDashboard,
  Users,
  Calendars,
  ShelvingUnit,
  LogOut,
  DownloadIcon,
  FileSliders,
} from "lucide-vue-next";
import logoUrl from "../assets/logo.png";

const router = useRouter();
defineProps(["isOpen"]);
defineEmits(["close"]);

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Data Relawan", path: "/kelola-relawan", icon: Users },
  { name: "Jadwal kerja", path: "/jadwal-kerja", icon: Calendars },
  { name: "Manajemen Gudang", path: "/data-gudang", icon: ShelvingUnit },
  { name: "Laporan Stok", path: "/laporan-stok", icon: FileSliders },
  { name: "Riwayat Absensi", path: "/riwayat-absensi", icon: DownloadIcon },
  { name: "Rekap Absensi", path: "/rekap-absensi", icon: DownloadIcon },
];

// Fungsi Logout
async function handleLogout() {
  const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari sistem?");

  if (confirmLogout) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Tutup sidebar (untuk mobile) lalu pindah ke login
      // $emit('close');
      router.push("/login");
    } catch (err) {
      alert("Error saat logout: " + err.message);
    }
  }
}
</script>
