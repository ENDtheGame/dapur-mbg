<template>
  <main class="p-6 md:p-10 bg-white min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3">
          <select
            v-model="filterBulan"
            class="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="m in 12" :key="m" :value="m">
              {{ namaBulan(m) }}
            </option>
          </select>

          <button
            @click="exportToExcel"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition active:scale-95"
          >
            <DownloadIcon :size="18" />
            Export ke Excel/Sheets
          </button>
        </div>
      </div>

      <div
        class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm"
      >
        <table class="w-full text-left border-separate border-spacing-0">
          <thead class="bg-slate-50">
            <tr>
              <th
                class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase"
              >
                Nama Relawan
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase"
              >
                Divisi
              </th>
              <th
                class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase"
              >
                Total Shift
              </th>
              <th
                class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase"
              >
                Estimasi Jam
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="item in rekapData"
              :key="item.id"
              class="hover:bg-slate-50/50 transition"
            >
              <td class="px-6 py-4 font-bold text-slate-700">
                {{ item.nama }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-lg uppercase border border-sky-100"
                  :class="[
                    getDivisiStyle(item.divisi).bg,
                    getDivisiStyle(item.divisi).text,
                    getDivisiStyle(item.divisi).border,
                  ]"
                >
                  {{ item.divisi }}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-black text-slate-600">
                {{ item.totalShift }}x
              </td>
              <td class="px-6 py-4 text-center text-slate-500 font-medium">
                {{ item.totalJam }} Jam
              </td>
            </tr>
            <tr v-if="rekapData.length === 0">
              <td colspan="4" class="py-20 text-center text-slate-400 italic">
                Belum ada data di bulan ini
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { supabase } from "../lib/supabaseClient";
import { DownloadIcon } from "lucide-vue-next";
import * as XLSX from "xlsx"; // Kamu perlu install: npm install xlsx

const filterBulan = ref(new Date().getMonth() + 1);
const rekapData = ref([]);
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

const namaBulan = (m) => {
  return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(2024, m - 1),
  );
};

async function fetchRekap() {
  const tahun = new Date().getFullYear();
  const bulan = filterBulan.value;
  const awalBulan = new Date(tahun, bulan - 1, 1).toISOString().split("T")[0];
  const akhirBulan = new Date(tahun, bulan, 0).toISOString().split("T")[0];

  // 1. Ambil data jadwal dan relawan saja (Tanpa Divisi dulu biar gak error)
  const { data, error } = await supabase
    .from("jadwal_kerja")
    .select(
      `
      *,
      relawan (
        nama_relawan,
        divisi_id
      )
    `,
    )
    .gte("tanggal", awalBulan)
    .lte("tanggal", akhirBulan);

  if (error) {
    console.error("Error Fetch Jadwal:", error.message);
    return;
  }

  // 2. Ambil data semua divisi untuk mapping manual
  const { data: dataDivisi } = await supabase.from("divisi").select("*");
  const mapDivisi = {};
  dataDivisi?.forEach((d) => {
    mapDivisi[d.id] = d.nama_divisi;
  });

  if (data) {
    const map = {};
    data.forEach((j) => {
      const relId = j.relawan_id || j.rfid_uid;

      if (!map[relId]) {
        // Ambil nama divisi dari mapDivisi yang kita buat tadi
        const idDivisiRelawan = j.relawan?.divisi_id;
        const namaDivisi = mapDivisi[idDivisiRelawan] || "Umum";

        map[relId] = {
          nama: j.relawan?.nama_relawan || `Anonim (${j.rfid_uid})`,
          divisi: namaDivisi,
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

// FUNGSI EXPORT KE EXCEL/GOOGLE SHEETS
function exportToExcel() {
  const dataExport = rekapData.value.map((item) => ({
    "Nama Relawan": item.nama,
    Divisi: item.divisi,
    "Total Kehadiran": item.totalShift,
    "Total Jam Kerja": item.totalJam,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");

  // Download file
  XLSX.writeFile(
    workbook,
    `Rekap_Absensi_${namaBulan(filterBulan.value)}.xlsx`,
  );
}

watch(filterBulan, () => {
  fetchRekap();
});

onMounted(fetchRekap);
</script>
