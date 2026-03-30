import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "../layouts/AdminLayout.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import KelolaRelawan from "../views/KelolaRelawan.vue";
import TambahRelawan from "../views/TambahRelawan.vue";
import EditRelawan from "../views/EditRelawan.vue";
import JadwalKerja from "../views/JadwalKerja.vue";
import RiwayatAbsensi from "../views/RiwayatAbsensi.vue";
import RekapAbsensi from "../views/RekapAbsensi.vue";
import LogPresensi from "../views/LogPresensi.vue";
import LaporanStok from "../views/LaporanOpname.vue";
import Gudang from "../views/Gudang.vue";
import Resep from "../views/Resep.vue";
import DistribusiPorsi from "../views/DistribusiPorsi.vue"

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    path: "/",
    component: AdminLayout, // Bungkus utamanya di sini
    meta: { requiresAuth: true },
    children: [
      {
        path: "/login",
        name: "login",
        component: Login,
        meta: { hideAssistant: true },
      },
      { path: "dashboard", component: Dashboard },
      { path: "kelola-relawan", component: KelolaRelawan },
      { path: "tambah-relawan", component: TambahRelawan },
      { path: "/edit-relawan/:id", component: EditRelawan },
      { path: "/jadwal-kerja", component: JadwalKerja },
      { path: "/rekap-absensi", component: RekapAbsensi },
      { path: "/log-presensi", component: LogPresensi },
      { path: "/data-gudang", component: Gudang },
      { path: "/resep", component: Resep},
      { path: "/distribusi-porsi", component: DistribusiPorsi},
      { path: "/laporan-stok", component: LaporanStok },
      { path: "/riwayat-absensi", component: RiwayatAbsensi },

      // Halaman lain nanti tinggal tambah di sini
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
