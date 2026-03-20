<template>
  <main class="p-6 md:p-10 bg-white min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <select v-model="filterBulan" class="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
            <option v-for="m in 12" :key="m" :value="m">{{ namaBulan(m) }}</option>
          </select>
          
          <button @click="exportToExcel" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition active:scale-95">
            <DownloadIcon :size="18" />
            Export ke Excel/Sheets
          </button>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table class="w-full text-left border-separate border-spacing-0">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nama Relawan</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Divisi</th>
              <th class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Total Shift</th>
              <th class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase">Estimasi Jam</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="item in rekapData" :key="item.id" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.nama }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-lg uppercase border border-sky-100">
                  {{ item.divisi }}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-black text-slate-600">{{ item.totalShift }}x</td>
              <td class="px-6 py-4 text-center text-slate-500 font-medium">{{ item.totalJam }} Jam</td>
            </tr>
            <tr v-if="rekapData.length === 0">
              <td colspan="4" class="py-20 text-center text-slate-400 italic">Belum ada data di bulan ini</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { DownloadIcon } from 'lucide-vue-next';
import * as XLSX from 'xlsx'; // Kamu perlu install: npm install xlsx

const filterBulan = ref(new Date().getMonth() + 1);
const rekapData = ref([]);

const namaBulan = (m) => {
  return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, m - 1));
};

async function fetchRekap() {
  // Logic mengambil semua jadwal di bulan terpilih
  // Kemudian di-grouping berdasarkan relawan_id menggunakan JavaScript
  const { data } = await supabase
    .from('jadwal_kerja')
    .select('*, relawan(nama_relawan, divisi(nama_divisi))');

  if (data) {
    const map = {};
    data.forEach(j => {
      const relId = j.relawan_id || j.rfid_uid;
      if (!map[relId]) {
        map[relId] = { 
          nama: j.relawan?.nama_relawan || 'Anonim', 
          divisi: j.relawan?.divisi?.nama_divisi || 'Umum',
          totalShift: 0,
          totalJam: 0 
        };
      }
      map[relId].totalShift += 1;
      // Tambahkan logika hitung selisih jam jika perlu
    });
    rekapData.value = Object.values(map);
  }
}

// FUNGSI EXPORT KE EXCEL/GOOGLE SHEETS
function exportToExcel() {
  const dataExport = rekapData.value.map(item => ({
    'Nama Relawan': item.nama,
    'Divisi': item.divisi,
    'Total Kehadiran': item.totalShift,
    'Total Jam Kerja': item.totalJam
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");
  
  // Download file
  XLSX.writeFile(workbook, `Rekap_Absensi_${namaBulan(filterBulan.value)}.xlsx`);
}

onMounted(fetchRekap);
</script>
