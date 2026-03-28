<template>
  <main class="p-3 md:p-8 bg-slate-50 min-h-screen pb-24 text-left">
    <div class="max-w-7xl mx-auto space-y-6">
      <div
        class="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:flex md:items-center gap-2"
      >
        <div class="relative flex-1">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            :size="16"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
          />
        </div>

        <select
          v-model="filterDivisi"
          class="px-3 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer min-w-[140px]"
        >
          <option value="Semua">Semua Divisi</option>
          <option v-for="d in daftarDivisi" :key="d" :value="d">{{ d }}</option>
        </select>

        <input
          v-model="filterTanggal"
          type="date"
          class="px-3 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none"
        />

        <div class="flex items-center gap-1 ml-auto">
          <button
            @click="loadAbsensi"
            class="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition rounded-xl"
            title="Refresh"
          >
            <RefreshCw :size="18" :class="loading ? 'animate-spin' : ''" />
          </button>

          <button
            @click="exportToExcel"
            class="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 rounded-xl shadow-sm text-white hover:bg-emerald-700 transition font-bold text-xs"
          >
            <Download :size="14" />
            <span>Export</span>
          </button>

          <button
            @click="resetFilter"
            class="px-2 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr class="bg-slate-50/50">
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100"
                >
                  No
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100"
                >
                  Relawan
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100"
                >
                  Divisi
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-center"
                >
                  Tap Masuk
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-center"
                >
                  Tap Pulang
                </th>
                <th
                  class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-right"
                >
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="(log, index) in filteredAbsensi"
                :key="log.rfid_uid + log.tanggal_tap"
                class="hover:bg-sky-50/30 transition-colors group"
              >
                <td
                  class="px-6 py-4 text-center text-xs font-bold text-slate-400"
                >
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-slate-800 text-sm">
                    {{ log.nama_relawan || "Unknown" }}
                  </p>
                  <p
                    class="text-[9px] font-mono text-slate-400 tracking-tighter"
                  >
                    {{ log.rfid_uid }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-3 py-1 text-[10px] font-black rounded-lg uppercase border shadow-sm"
                    :class="[
                      getDivisiStyle(log.nama_divisi).bg,
                      getDivisiStyle(log.nama_divisi).text,
                      getDivisiStyle(log.nama_divisi).border,
                    ]"
                  >
                    {{ log.nama_divisi || "Umum" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span
                    v-if="log.jam_masuk"
                    class="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg"
                  >
                    {{ log.jam_masuk }}
                  </span>
                  <span v-else class="text-xs font-bold text-slate-300"
                    >--:--</span
                  >
                </td>
                <td class="px-6 py-4 text-center">
                  <span
                    v-if="log.jam_pulang"
                    class="text-sm font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg"
                  >
                    {{ log.jam_pulang }}
                  </span>
                  <span v-else class="text-xs font-bold text-slate-300"
                    >--:--</span
                  >
                </td>
                <td
                  class="px-6 py-4 text-right text-xs font-bold text-slate-500"
                >
                  {{ formatDateShort(log.tanggal_tap) }}
                </td>
              </tr>

              <tr v-if="!loading && filteredAbsensi.length === 0">
                <td
                  colspan="6"
                  class="px-6 py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { supabase } from "../lib/supabaseClient";
import * as XLSX from "xlsx";
import { RefreshCw, Search, Download } from "lucide-vue-next";

const loading = ref(true);
const absensiList = ref([]);
const searchQuery = ref("");
const filterDivisi = ref("Semua");
const filterTanggal = ref("");

let absensiChannel = null;

const getDivisiStyle = (namaDivisi) => {
  const styles = [
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
    {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  ];
  if (!namaDivisi)
    return {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    };
  let hash = 0;
  for (let i = 0; i < namaDivisi.length; i++) {
    hash = namaDivisi.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
};

// --- Helper Format Tanggal ---
const formatDateShort = (d) => {
  if (!d || d === "Unknown") return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --- Load Data dari View ---
async function loadAbsensi() {
  loading.value = true;
  try {
    // Memanggil view yang sudah kita buat di atas
    const { data, error } = await supabase
      .from("report_absensi_harian")
      .select("*")
      .order("waktu_asli", { ascending: false });

    if (error) throw error;

    // Simpan data langsung ke list
    absensiList.value = data || [];
  } catch (e) {
    console.error("Gagal load data:", e.message);
  } finally {
    loading.value = false;
  }
}

// --- Logic Grouping (Gabung Masuk & Pulang) ---
const filteredAbsensi = computed(() => {
  const grouped = {};

  absensiList.value.forEach((item) => {
    // 1. Filter seperti biasa
    const nama = (item.nama_relawan || "").toLowerCase();
    const matchSearch = nama.includes(searchQuery.value.toLowerCase());
    const matchTanggal =
      !filterTanggal.value || item.tanggal_tap === filterTanggal.value;
    const matchDivisi =
      filterDivisi.value === "Semua" || item.nama_divisi === filterDivisi.value;

    if (matchSearch && matchTanggal && matchDivisi) {
      const key = `${item.rfid_uid}_${item.tanggal_tap}`;

      if (!grouped[key]) {
        grouped[key] = {
          rfid_uid: item.rfid_uid,
          nama_relawan: item.nama_relawan,
          nama_divisi: item.nama_divisi,
          tanggal_tap: item.tanggal_tap,
          jam_masuk: null,
          jam_pulang: null,
        };
      }

      const status = (item.status_absensi || "").toUpperCase();

      // Ambil 5 karakter jam dari string (contoh: "20:42")
      const jamHanya = item.waktu_asli
        ? item.waktu_asli.substring(11, 16)
        : "--:--";

      if (status === "MASUK") {
        grouped[key].jam_masuk = jamHanya;
      } else if (status === "PULANG") {
        grouped[key].jam_pulang = jamHanya;
      }
    }
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(b.tanggal_tap) - new Date(a.tanggal_tap),
  );
});

const setupRealtime = () => {
  if (absensiChannel) supabase.removeChannel(absensiChannel);
  absensiChannel = supabase
    .channel("perubahan-absensi")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "absensi_relawan" },
      () => {
        loadAbsensi();
      },
    )
    .subscribe();
};

onMounted(async () => {
  await loadAbsensi();
  setupRealtime();
});

onUnmounted(() => {
  if (absensiChannel) supabase.removeChannel(absensiChannel);
});

const daftarDivisi = computed(() => {
  const divs = absensiList.value
    .map((item) => item.nama_divisi)
    .filter(Boolean);
  return [...new Set(divs)];
});

const resetFilter = () => {
  searchQuery.value = "";
  filterDivisi.value = "Semua";
  filterTanggal.value = "";
};

const exportToExcel = () => {
  const dataUntukExcel = filteredAbsensi.value.map((log, index) => ({
    No: index + 1,
    Nama: log.nama_relawan || "Unknown",
    RFID: log.rfid_uid,
    Divisi: log.nama_divisi || "Umum",
    "Jam Masuk": log.jam_masuk || "--:--",
    "Jam Pulang": log.jam_pulang || "--:--",
    Tanggal: formatDateShort(log.tanggal_tap),
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
  XLSX.writeFile(
    workbook,
    `Absensi_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
</script>
