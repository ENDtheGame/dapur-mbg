<template>
  <main
    class="p-3 md:p-8 bg-gradient-to-b from-sky-50/50 to-white min-h-screen pb-24 text-left"
  >
    <div class="max-w-7xl mx-auto space-y-6 md:space-y-8 text-left">
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div
          class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5"
        >
          <div
            class="w-10 h-10 md:w-14 md:h-14 bg-sky-100 rounded-xl md:rounded-2xl flex items-center justify-center text-sky-600 shrink-0"
          >
            <BookUser :size="20" class="md:hidden" />
            <BookUser :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p
              class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter"
            >
              Relawan
            </p>
            <p class="text-lg md:text-3xl font-black text-slate-800">
              {{ totalRelawan }}
            </p>
          </div>
        </div>

        <div
          class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5"
        >
          <div
            class="w-10 h-10 md:w-14 md:h-14 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 shrink-0"
          >
            <CalendarIcon :size="20" class="md:hidden" />
            <CalendarIcon :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p
              class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter"
            >
              Jadwal
            </p>
            <p class="text-lg md:text-3xl font-black text-slate-800">
              {{ jadwalHariIni.length }}
            </p>
          </div>
        </div>

        <div
          class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5"
        >
          <div
            class="w-10 h-10 md:w-14 md:h-14 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0"
          >
            <PackageIcon :size="20" class="md:hidden" />
            <PackageIcon :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p
              class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter"
            >
              Logistik
            </p>
            <p class="text-lg md:text-3xl font-black text-slate-800">
              {{ totalJenisBarang }}
              <span class="text-[10px] font-bold text-slate-400">Jenis</span>
            </p>
          </div>
        </div>

        <router-link
          to="/data-gudang"
          class="cursor-pointer transition active:scale-95 block group h-full"
        >
          <div
            class="p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-5 shadow-sm border h-full"
            :class="
              barangKritis.length > 0
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-white border-slate-100 text-slate-800'
            "
          >
            <div
              class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
              :class="
                barangKritis.length > 0
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-50 text-rose-500'
              "
            >
              <Store
                :size="20"
                :class="barangKritis.length > 0 ? 'animate-bounce' : ''"
              />
            </div>
            <div class="truncate text-left">
              <p
                class="text-[9px] md:text-sm font-bold uppercase tracking-tighter"
                :class="
                  barangKritis.length > 0 ? 'text-rose-100' : 'text-slate-400'
                "
              >
                Kritis
              </p>
              <p class="text-lg md:text-3xl font-black">
                {{ barangKritis.length }}
                <span
                  class="text-[10px] font-bold"
                  :class="
                    barangKritis.length > 0 ? 'text-rose-100' : 'text-slate-400'
                  "
                  >Item</span
                >
              </p>
            </div>
          </div>
        </router-link>

        <div
          class="col-span-2 lg:col-span-1 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5"
        >
          <div
            class="w-10 h-10 md:w-14 md:h-14 bg-amber-100 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-600 shrink-0"
          >
            <LayersIcon :size="20" class="md:hidden" />
            <LayersIcon :size="28" class="hidden md:block" />
          </div>
          <div class="text-left">
            <p
              class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter"
            >
              Divisi
            </p>
            <p class="text-lg md:text-3xl font-black text-slate-800">
              {{ totalDivisi }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section
          class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div class="p-5 md:p-6 border-b border-slate-50 text-left">
            <h3 class="font-bold text-slate-800 text-sm md:text-base">
              Diagram Stok
            </h3>
          </div>

          <div class="p-4">
            <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                class="flex flex-col items-center justify-center border-r border-slate-50"
              >
                <p class="text-[10px] font-bold text-slate-400 mb-2 uppercase">
                  Total Pergerakan
                </p>
                <apexchart
                  type="donut"
                  height="220"
                  :options="chartOptions"
                  :series="chartSeries"
                ></apexchart>
              </div>

              <div class="space-y-6">
                <div class="text-center">
                  <p
                    class="text-[9px] font-bold text-emerald-500 mb-1 uppercase tracking-wider"
                  >
                    Stok Masuk
                  </p>
                  <apexchart
                    type="donut"
                    height="150"
                    :options="categoryChartOptions('Masuk', labelsKategori)"
                    :series="seriesMasuk"
                  ></apexchart>
                </div>

                <div class="text-center">
                  <p
                    class="text-[9px] font-bold text-rose-500 mb-1 uppercase tracking-wider"
                  >
                    Stok Keluar
                  </p>
                  <apexchart
                    type="donut"
                    height="150"
                    :options="categoryChartOptions('Keluar', labelsKategori)"
                    :series="seriesKeluar"
                  ></apexchart>
                </div>
              </div>
            </div>

            <div v-else class="h-[250px] flex items-center justify-center">
              <div class="animate-pulse flex space-x-4">
                <div class="rounded-full bg-slate-100 h-32 w-32"></div>
                <div class="space-y-4 py-1">
                  <div class="h-4 bg-slate-100 rounded w-24"></div>
                  <div class="h-4 bg-slate-100 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div
            class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left"
          >
            <h3 class="font-bold text-slate-800 text-sm md:text-base">
              Riwayat Stok
            </h3>
            <router-link
              to="/data-gudang"
              class="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
              >Kelola Stok</router-link
            >
          </div>
          <div class="p-4 md:p-6 space-y-4">
            <div
              v-for="log in riwayatStok"
              :key="log.id"
              class="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl"
            >
              <div class="flex items-center gap-3 truncate">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :class="
                    log.tipe_perubahan === 'Masuk'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  "
                >
                  <PlusIcon v-if="log.tipe_perubahan === 'Masuk'" :size="18" />
                  <MinusIcon v-else :size="18" />
                </div>
                <div class="truncate text-left">
                  <p
                    class="text-xs md:text-sm font-bold text-slate-700 truncate"
                  >
                    {{ log.stok_bahan?.nama_bahan }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ formatDate(log.dibuat_pada) }}
                  </p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p
                  class="text-xs md:text-sm font-black"
                  :class="
                    log.tipe_perubahan === 'Masuk'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  "
                >
                  {{ log.tipe_perubahan === "Masuk" ? "+" : "-"
                  }}{{ log.jumlah_perubahan }}
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase">
                  {{ log.stok_bahan?.satuan_kecil }}
                </p>
              </div>
            </div>
            <div
              v-if="riwayatStok.length === 0"
              class="py-10 text-center text-slate-400 text-xs italic"
            >
              Belum ada riwayat stok
            </div>
          </div>
        </section>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section
          class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div
            class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left"
          >
            <h3 class="font-bold text-slate-800 text-sm md:text-base">
              Jadwal Kerja Hari Ini
            </h3>
            <router-link
              to="/jadwal-kerja"
              class="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
            >
              Atur Jadwal
            </router-link>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead
                class="bg-slate-50 text-[9px] md:text-[10px] uppercase text-slate-400 font-black"
              >
                <tr>
                  <th class="px-6 py-3">Divisi</th>
                  <th class="px-6 py-3 text-center">Jumlah Relawan</th>
                  <th class="px-6 py-3 text-center">Waktu Kerja</th>
                  <th class="px-6 py-3">Tugas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-left">
                <tr
                  v-for="grup in jadwalPerDivisi"
                  :key="grup.nama_divisi"
                  class="text-[11px] md:text-sm hover:bg-slate-50/50 transition"
                >
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 text-[10px] font-black rounded-lg uppercase border shadow-sm"
                      :class="[
                        getDivisiStyle(grup.nama_divisi).bg,
                        getDivisiStyle(grup.nama_divisi).text,
                        getDivisiStyle(grup.nama_divisi).border,
                      ]"
                    >
                      {{ grup.nama_divisi }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-center">
                    <div
                      class="inline-flex items-center gap-1.5 text-slate-600 font-bold"
                    >
                      <UsersIcon :size="14" class="text-slate-400" />
                      {{ grup.jumlah_relawan }}
                      <span class="text-[10px] text-slate-400 font-normal"
                        >Orang</span
                      >
                    </div>
                  </td>

                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight"
                    >
                      {{ grup.jam_masuk }} - {{ grup.jam_pulang }}
                    </span>
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex items-start gap-2">
                      <span class="text-emerald-500 mt-0.5">
                        <ClipboardCheckIcon :size="14" />
                      </span>
                      <p
                        class="text-[11px] md:text-xs text-slate-600 font-medium leading-relaxed"
                      >
                        {{ grup.tugas }}
                      </p>
                    </div>
                  </td>
                </tr>

                <tr v-if="jadwalPerDivisi.length === 0">
                  <td
                    colspan="4"
                    class="px-6 py-12 text-center text-slate-400 text-xs italic font-medium"
                  >
                    Belum ada pembagian tugas divisi hari ini
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section
          class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div
            class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left"
          >
            <div>
              <h3 class="font-bold text-slate-800 text-sm md:text-base">
                Absensi Terbaru
              </h3>
            </div>
            <router-link
              to="/riwayat-absensi"
              class="text-[10px] md:text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full"
              >Lihat Semua</router-link
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead
                class="bg-slate-50 text-[10px] uppercase text-slate-400 font-black"
              >
                <tr>
                  <th class="px-6 py-3">Relawan</th>
                  <th class="px-6 py-3 text-left">Divisi</th>
                  <th class="px-6 py-3">Waktu</th>
                  <th class="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="abs in riwayatAbsensiTerbaru"
                  :key="abs.absensi_id"
                  class="text-sm hover:bg-slate-50/50 transition"
                >
                  <!-- KOLOM NAMA & DIVISI -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col text-left">
                      <span class="font-bold text-slate-700">
                        {{ abs.nama_relawan || "Tanpa Nama" }}
                      </span>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 text-slate-500 text-[10px] font-medium text-left"
                  >
                    <span
                      class="px-3 py-1 text-[10px] font-black rounded-lg uppercase border shadow-sm"
                      :class="[
                        getDivisiStyle(abs.nama_divisi).bg,
                        getDivisiStyle(abs.nama_divisi).text,
                        getDivisiStyle(abs.nama_divisi).border,
                      ]"
                    >
                      {{ abs.nama_divisi || "Umum" }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 text-slate-500 font-medium text-xs text-left"
                  >
                    {{ abs.jam_tampil }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      :class="[
                        'px-2 py-1 rounded-lg text-[10px] font-black uppercase border opacity-80 transition-colors',
                        (abs.status_absensi || '').trim().toUpperCase() ===
                        'MASUK'
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          : (abs.status_absensi || '').trim().toUpperCase() ===
                              'PULANG'
                            ? 'text-orange-600 bg-orange-50 border-orange-200'
                            : 'text-slate-500 bg-slate-50 border-slate-200',
                      ]"
                    >
                      {{ abs.status_absensi }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { supabase } from "../lib/supabaseClient";
import VueApexCharts from "vue3-apexcharts";
import Swal from "sweetalert2";
import {
  BookUser,
  CalendarIcon,
  LayersIcon,
  PackageIcon,
  Store,
  PlusIcon,
  MinusIcon,
  UsersIcon,
  ClipboardCheckIcon,
} from "lucide-vue-next";

const apexchart = VueApexCharts;

const totalRelawan = ref(0);
const totalDivisi = ref(0);
const jadwalHariIni = ref([]);
const riwayatStok = ref([]);
const loading = ref(true);
const daftarPerKategori = ref({});

// Pastikan chartSeries menggunakan ref()
const chartSeries = ref([0, 0]);
const seriesMasuk = ref([]);
const seriesKeluar = ref([]);
const labelsKategori = ref([]);

// Gunakan ref() untuk chartOptions agar reaktif
const chartOptions = ref({
  chart: { id: "donut-stok", fontFamily: "Inter, sans-serif" },
  labels: ["Masuk", "Keluar"],
  colors: ["#10b981", "#f43f5e"],
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  legend: { position: "bottom", fontSize: "10px" },
});

const categoryChartOptions = (tipe, labels) => ({
  chart: {
    type: "pie",
    fontFamily: "Inter, sans-serif",
  },
  labels: labels,
  colors:
    tipe === "Masuk"
      ? ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"] // Variasi Hijau
      : ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3"], // Variasi Merah
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: { show: false }, // Matikan legend agar tidak sempit
  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        labels: {
          show: true,
          name: { show: false },
          total: {
            show: true,
            label: tipe,
            fontSize: "10px",
            fontWeight: "bold",
            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} unit`,
    },
  },
});

const totalJenisBarang = computed(
  () => Object.values(daftarPerKategori.value).flat().length,
);

const isStokKritis = (item) => {
  const stok = parseFloat(item.total_stok_kecil || 0);
  const limit = parseFloat(item.stok_minimum_kecil || 0);
  return stok <= limit;
};

const barangKritis = computed(() => {
  let list = [];
  if (daftarPerKategori.value) {
    Object.keys(daftarPerKategori.value).forEach((kat) => {
      const kritis = daftarPerKategori.value[kat].filter((item) =>
        isStokKritis(item),
      );
      list.push(...kritis);
    });
  }
  return list;
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return (
    date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " - " +
    date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  );
};

async function loadAllData() {
  loading.value = true;
  try {
    const hariIni = new Date();
    const formatHariIni = hariIni.toLocaleDateString("en-CA");

    const tujuhHariLalu = new Date();
    tujuhHariLalu.setDate(hariIni.getDate() - 6);
    tujuhHariLalu.setHours(0, 0, 0, 0);

    // 1. Data Relawan
    const { data: allRelawan } = await supabase
      .from("relawan")
      .select("*, divisi!fk_divisi(nama_divisi)");
    totalRelawan.value = allRelawan?.length || 0;

    // 2. Jadwal Hari Ini
    const { data: jadwalRaw } = await supabase
      .from("jadwal_kerja")
      .select("*")
      .eq("tanggal", formatHariIni)
      .order("jam_masuk", { ascending: true });

    if (jadwalRaw && allRelawan) {
      jadwalHariIni.value = jadwalRaw.map((j) => ({
        ...j,
        relawan: allRelawan.find(
          (rel) =>
            (j.relawan_id && rel.id === j.relawan_id) ||
            (j.rfid_uid && rel.rfid_uid === j.rfid_uid),
        ),
      }));
    }

    // 3. Data Gudang
    const { data: dataGudang } = await supabase
      .from("stok_bahan")
      .select("*, kategori:kategori_bahan(nama_kategori)");

    if (dataGudang) {
      daftarPerKategori.value = dataGudang.reduce((acc, obj) => {
        const key = obj.kategori?.nama_kategori || "Tanpa Kategori";
        if (!acc[key]) acc[key] = [];
        acc[key].push(obj);
        return acc;
      }, {});
    }

    // 4. Riwayat Stok & Grafik
    // Di dalam loadAllData()
    const { data: dataLog, error: logError } = await supabase
      .from("riwayat_gudang")
      .select(
        `
        id, tipe_perubahan, jumlah_perubahan, dibuat_pada,
        stok_bahan!stok_id (
          nama_bahan,
          kategori_bahan!kategori_id ( nama_kategori )
        )
      `,
      )
      .gte("dibuat_pada", tujuhHariLalu.toISOString())
      .order("dibuat_pada", { ascending: false });

    if (!logError && dataLog) {
      riwayatStok.value = dataLog.slice(0, 6);

      // HITUNG TOTAL UNTUK DONUT CHART
      const totalM = dataLog
        .filter((l) => l.tipe_perubahan === "Masuk")
        .reduce((sum, item) => sum + Number(item.jumlah_perubahan), 0);

      const totalK = dataLog
        .filter((l) => l.tipe_perubahan === "Keluar")
        .reduce((sum, item) => sum + Number(item.jumlah_perubahan), 0);

      // UPDATE .value (JANGAN pakai const lagi di sini)
      chartSeries.value = [totalM, totalK];

      // PROSES REKAP KATEGORI
      const rekap = {};
      dataLog.forEach((log) => {
        const namaKat =
          log.stok_bahan?.kategori_bahan?.nama_kategori || "Tanpa Kategori";
        if (!rekap[namaKat]) rekap[namaKat] = { m: 0, k: 0 };

        if (log.tipe_perubahan === "Masuk") {
          rekap[namaKat].m += Number(log.jumlah_perubahan);
        } else if (log.tipe_perubahan === "Keluar") {
          rekap[namaKat].k += Number(log.jumlah_perubahan);
        }
      });

      // UPDATE STATE GLOBAL (Penting: Gunakan .value)
      labelsKategori.value = Object.keys(rekap);
      seriesMasuk.value = Object.values(rekap).map((d) => d.m);
      seriesKeluar.value = Object.values(rekap).map((d) => d.k);
    }

    const { count: countDivisi } = await supabase
      .from("divisi")
      .select("*", { count: "exact", head: true });
    totalDivisi.value = countDivisi || 0;
  } catch (e) {
    console.error("Dashboard Error:", e.message);
  } finally {
    loading.value = false;
  }
}

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

const riwayatAbsensiTerbaru = ref([]);
let absensiChannel = null;

const formatJam = (jamStr) => {
  if (!jamStr) return "-";
  // Karena jamStr sudah berbentuk "20:42", kita tidak perlu new Date()
  // Kita pastikan saja hanya mengambil 5 karakter pertama (HH:mm)
  return jamStr.substring(0, 5);
};

// Kelompokkan jadwal berdasarkan divisi
// --- BAGIAN YANG DIPERBAIKI ---
const jadwalPerDivisi = computed(() => {
  const grup = {};

  jadwalHariIni.value.forEach((j) => {
    // Ambil nama divisi, jika tidak ada masuk ke "Umum"
    const namaDivisi = j.relawan?.divisi?.nama_divisi || "Umum";

    if (!grup[namaDivisi]) {
      grup[namaDivisi] = {
        nama_divisi: namaDivisi,
        jumlah_relawan: 0,
        jam_masuk: j.jam_masuk || "-",
        jam_pulang: j.jam_pulang || "-",
        tugas: j.keterangan || "Tugas Rutin",
        daftar_nama: [],
      };
    }

    grup[namaDivisi].jumlah_relawan++;
    if (j.relawan?.nama_relawan) {
      grup[namaDivisi].daftar_nama.push(j.relawan.nama_relawan);
    }
  });

  return Object.values(grup);
});
// --- SELESAI PERBAIKAN ---

async function loadAbsensiTerbaru() {
  try {
    const { data, error } = await supabase
      .from("report_dashboard_terbaru")
      .select("*")
      .order("waktu_asli", { ascending: false })
      .limit(5);

    if (error) throw error;

    riwayatAbsensiTerbaru.value = data.map((item) => {
      // PERBAIKAN: Hapus spasi di nama variabel dan gunakan split manual
      // Format asli: "2026-03-26T20:42:54+00:00"
      let jamFix = "--:--";

      if (item.waktu_asli) {
        // Ambil bagian setelah huruf 'T' (yaitu 20:42:54)
        const bagianWaktu = item.waktu_asli.split("T")[1];
        // Ambil 5 karakter pertama (yaitu 20:42)
        jamFix = bagianWaktu.substring(0, 5);
      }

      return {
        ...item,
        jam_tampil: jamFix,
      };
    });
  } catch (e) {
    console.error("Gagal load absensi terbaru:", e.message);
  }
}

const setupRealtimeDashboard = () => {
  absensiChannel = supabase
    .channel("dashboard-absensi")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "absensi_relawan" },
      () => {
        // Panggil kembali data terbaru setiap ada yang tap kartu
        loadAbsensiTerbaru();
        loadAllData(); // Update statistik di atas (jumlah relawan dll)
      },
    )
    .subscribe();
};

const setupRealtimeAbsensi = () => {
  absensiChannel = supabase
    .channel("notif-absen-masuk")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "absensi_relawan",
      },
      async (payload) => {
        // Ambil data relawan agar kita tahu siapa yang barusan tap
        const { data: relawan } = await supabase
          .from("relawan")
          .select("nama_relawan")
          .eq("rfid_uid", payload.new.rfid_uid)
          .single();

        const nama = relawan ? relawan.nama_relawan : "Tamu/Kartu Baru";
        const status = payload.new.status_absensi; // 'Masuk' atau 'Pulang'

        // Tampilkan Notifikasi Toast
        Swal.fire({
          icon: status === "Masuk" ? "success" : "info",
          title: `Absensi ${status}`,
          text: `${nama} baru saja ${status === "Masuk" ? "masuk" : "pulang"}.`,
          toast: true,
          position: "top-end",
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        fetchStatistikDashboard();
      },
    )
    .subscribe();
};

onMounted(async () => {
  await loadAllData();
  await loadAbsensiTerbaru();
  setupRealtimeDashboard();
  setupRealtimeAbsensi();
});

onUnmounted(() => {
  if (absensiChannel) supabase.removeChannel(absensiChannel);
});
</script>
