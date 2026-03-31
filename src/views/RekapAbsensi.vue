<template>
  <main class="p-6 md:p-10 bg-white min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Bagian Header yang Disejajarkan -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <!-- Live Search -->
          <div class="relative flex-1 md:flex-none">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama atau divisi..."
              class="w-full md:w-64 p-3 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <span class="absolute left-3 top-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
          </div>

          <!-- Filter Bulan -->
          <select
            v-model="filterBulan"
            class="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
          >
            <option v-for="m in 12" :key="m" :value="m">
              {{ namaBulan(m) }}
            </option>
          </select>

          <!-- Export Button -->
          <button
            @click="exportToExcel"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition active:scale-95 whitespace-nowrap"
          >
            <DownloadIcon :size="18" />
            <span class="hidden sm:inline">Export Excel</span>
            <span class="sm:hidden">Export</span>
          </button>
          
        </div>
      </div>

      <!-- Tabel Data -->
      <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-left">Nama Relawan</th>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-left">Divisi</th>
                <th class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Total Shift</th>
                <th class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Estimasi Jam</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in paginatedData" :key="item.id" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-bold text-slate-700">{{ item.nama }}</td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-[10px] font-black rounded-lg uppercase border"
                    :class="[
                      getDivisiStyle(item.divisi).bg,
                      getDivisiStyle(item.divisi).text,
                      getDivisiStyle(item.divisi).border,
                    ]"
                  >
                    {{ item.divisi }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-black text-slate-600">{{ item.totalShift }}x</td>
                <td class="px-6 py-4 text-center text-slate-500 font-medium">{{ item.totalJam }} Jam</td>
              </tr>
              <tr v-if="filteredData.length === 0">
                <td colspan="4" class="py-20 text-center text-slate-400 italic">Data tidak ditemukan</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredData.length > itemsPerPage" class="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Halaman {{ currentPage }} / {{ totalPages }}
          </span>
          <div class="flex gap-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { supabase } from "../lib/supabaseClient";
import { DownloadIcon } from "lucide-vue-next";
import * as XLSX from "xlsx";

const filterBulan = ref(new Date().getMonth() + 1);
const rekapData = ref([]);
const searchQuery = ref("");

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 10;

// --- COMPUTED PROPERTIES ---

// 1. Filter Data Berdasarkan Search Query
const filteredData = computed(() => {
  if (!searchQuery.value) return rekapData.value;
  
  const query = searchQuery.value.toLowerCase();
  return rekapData.value.filter(item => 
    item.nama.toLowerCase().includes(query) || 
    item.divisi.toLowerCase().includes(query)
  );
});

// 2. Paginate Data yang sudah difilter
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

// 3. Hitung Total Halaman
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage) || 1;
});

// Reset ke halaman 1 jika user melakukan pencarian atau ganti bulan
watch([searchQuery, filterBulan], () => {
  currentPage.value = 1;
});

// --- METHODS ---

const getDivisiStyle = (namaDivisi) => {
  const styles = [
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
    { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  ];
  if (!namaDivisi) return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  let hash = 0;
  for (let i = 0; i < namaDivisi.length; i++) {
    hash = namaDivisi.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
};

const namaBulan = (m) => {
  return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(2024, m - 1));
};

async function fetchRekap() {
  const tahun = new Date().getFullYear();
  const bulan = filterBulan.value;
  const awalBulan = new Date(tahun, bulan - 1, 1).toISOString().split("T")[0];
  const akhirBulan = new Date(tahun, bulan, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("jadwal_kerja")
    .select(`*, relawan ( nama_relawan, divisi_id )`)
    .gte("tanggal", awalBulan)
    .lte("tanggal", akhirBulan);

  if (error) {
    console.error("Error Fetch:", error.message);
    return;
  }

  const { data: dataDivisi } = await supabase.from("divisi").select("*");
  const mapDivisi = {};
  dataDivisi?.forEach((d) => { mapDivisi[d.id] = d.nama_divisi; });

  if (data) {
    const map = {};
    data.forEach((j) => {
      const relId = j.relawan_id || j.rfid_uid;
      if (!map[relId]) {
        const idDivisiRelawan = j.relawan?.divisi_id;
        map[relId] = {
          nama: j.relawan?.nama_relawan || `Anonim (${j.rfid_uid})`,
          divisi: mapDivisi[idDivisiRelawan] || "Umum",
          totalShift: 0,
          totalJam: 0,
        };
      }
      map[relId].totalShift += 1;
      if (j.jam_masuk && j.jam_pulang) {
        const [h1, m1] = j.jam_masuk.split(":").map(Number);
        const [h2, m2] = j.jam_pulang.split(":").map(Number);
        const selisih = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        if (selisih > 0) map[relId].totalJam += parseFloat(selisih.toFixed(1));
      }
    });
    rekapData.value = Object.values(map);
  }
}

function exportToExcel() {
  // Gunakan filteredData agar yang ter-export sesuai dengan hasil pencarian user
  const dataExport = filteredData.value.map((item) => ({
    "Nama Relawan": item.nama,
    Divisi: item.divisi,
    "Total Kehadiran": item.totalShift,
    "Total Jam Kerja": item.totalJam,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");
  XLSX.writeFile(workbook, `Rekap_Absensi_${namaBulan(filterBulan.value)}.xlsx`);
}

watch(filterBulan, fetchRekap);
onMounted(fetchRekap);
</script>
