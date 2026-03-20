<template>
  <main class="p-3 md:p-8 bg-gradient-to-b from-sky-50/50 to-white min-h-screen pb-24 text-left">
    <div class="max-w-7xl mx-auto space-y-6 md:space-y-8 text-left">
      
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5">
          <div class="w-10 h-10 md:w-14 md:h-14 bg-sky-100 rounded-xl md:rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
            <BookUser :size="20" class="md:hidden" />
            <BookUser :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter">Relawan</p>
            <p class="text-lg md:text-3xl font-black text-slate-800">{{ totalRelawan }}</p>
          </div>
        </div>

        <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5">
          <div class="w-10 h-10 md:w-14 md:h-14 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <CalendarIcon :size="20" class="md:hidden" />
            <CalendarIcon :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter">Jadwal</p>
            <p class="text-lg md:text-3xl font-black text-slate-800">{{ jadwalHariIni.length }}</p>
          </div>
        </div>

        <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-5">
          <div class="w-10 h-10 md:w-14 md:h-14 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <PackageIcon :size="20" class="md:hidden" />
            <PackageIcon :size="28" class="hidden md:block" />
          </div>
          <div class="truncate text-left">
            <p class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter">Logistik</p>
            <p class="text-lg md:text-3xl font-black text-slate-800">{{ totalJenisBarang }} <span class="text-[10px] font-bold text-slate-400">Jenis</span></p>
          </div>
        </div>

        <router-link to="/data-gudang" class="cursor-pointer transition active:scale-95 block group h-full">
          <div class="p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-5 shadow-sm border h-full"
               :class="barangKritis.length > 0 ? 'bg-rose-500 border-rose-400 text-white' : 'bg-white border-slate-100 text-slate-800'">
            <div class="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
                 :class="barangKritis.length > 0 ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'">
               <Store :size="20" :class="barangKritis.length > 0 ? 'animate-bounce' : ''" />
            </div>
            <div class="truncate text-left">
              <p class="text-[9px] md:text-sm font-bold uppercase tracking-tighter" :class="barangKritis.length > 0 ? 'text-rose-100' : 'text-slate-400'">Kritis</p>
              <p class="text-lg md:text-3xl font-black">{{ barangKritis.length }} <span class="text-[10px] font-bold" :class="barangKritis.length > 0 ? 'text-rose-100' : 'text-slate-400'">Item</span></p>
            </div>
          </div>
        </router-link>

        <div class="col-span-2 lg:col-span-1 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5">
          <div class="w-10 h-10 md:w-14 md:h-14 bg-amber-100 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <LayersIcon :size="20" class="md:hidden" />
            <LayersIcon :size="28" class="hidden md:block" />
          </div>
          <div class="text-left">
            <p class="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tighter">Divisi</p>
            <p class="text-lg md:text-3xl font-black text-slate-800">{{ totalDivisi }}</p>
          </div>
        </div>
      </div>

      <section class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left">
          <div>
            <h3 class="font-bold text-slate-800 text-sm md:text-base">Analisa Pergerakan Barang</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">7 Hari Terakhir</p>
          </div>
          <div class="flex gap-4">
             <div class="flex items-center gap-1.5">
               <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
               <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Masuk</span>
             </div>
             <div class="flex items-center gap-1.5">
               <span class="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
               <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Keluar</span>
             </div>
          </div>
        </div>
        <div class="p-4 md:p-6">
          <div class="h-[250px] md:h-[300px] w-full">
            <apexchart v-if="!loading" type="area" height="100%" :options="chartOptions" :series="chartSeries"></apexchart>
            <div v-else class="h-full w-full bg-slate-50 animate-pulse rounded-3xl"></div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left">
            <h3 class="font-bold text-slate-800 text-sm md:text-base">Riwayat Stok</h3>
            <router-link to="/data-gudang" class="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Kelola Stok</router-link>
          </div>
          <div class="p-4 md:p-6 space-y-4">
            <div v-for="log in riwayatStok" :key="log.id" class="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl">
              <div class="flex items-center gap-3 truncate">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     :class="log.tipe_perubahan === 'Masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
                  <PlusIcon v-if="log.tipe_perubahan === 'Masuk'" :size="18" />
                  <MinusIcon v-else :size="18" />
                </div>
                <div class="truncate text-left">
                  <p class="text-xs md:text-sm font-bold text-slate-700 truncate">{{ log.stok_bahan?.nama_bahan }}</p>
                  <p class="text-[10px] text-slate-400">{{ formatDate(log.dibuat_pada) }}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs md:text-sm font-black" :class="log.tipe_perubahan === 'Masuk' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ log.tipe_perubahan === 'Masuk' ? '+' : '-' }}{{ log.jumlah_perubahan }}
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase">{{ log.stok_bahan?.satuan_kecil }}</p>
              </div>
            </div>
            <div v-if="riwayatStok.length === 0" class="py-10 text-center text-slate-400 text-xs italic">Belum ada riwayat stok</div>
          </div>
        </section>

        <section class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center text-left">
            <h3 class="font-bold text-slate-800 text-sm md:text-base">Tugas Hari Ini</h3>
            <router-link to="/jadwal-kerja" class="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Atur Jadwal</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead class="bg-slate-50 text-[9px] md:text-[10px] uppercase text-slate-400 font-black">
                <tr>
                  <th class="px-5 py-3">Nama</th>
                  <th class="px-5 py-3 text-center">Jam</th>
                  <th class="px-5 py-3 text-right">Divisi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-left">
                <tr v-for="j in jadwalHariIni" :key="j.id" class="text-[11px] md:text-sm hover:bg-slate-50/50 transition">
                  <td class="px-5 py-4 font-bold text-slate-700 whitespace-nowrap">{{ j.relawan?.nama_relawan }}</td>
                  <td class="px-5 py-4 text-center whitespace-nowrap">
                    <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black">
                      {{ j.jam_masuk }} - {{ j.jam_pulang }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right whitespace-nowrap">
                    <span class="px-2 py-1 text-[8px] font-black rounded-lg uppercase border"
                          :class="[getDivisiStyle(j.relawan?.divisi?.nama_divisi).bg, getDivisiStyle(j.relawan?.divisi?.nama_divisi).text, getDivisiStyle(j.relawan?.divisi?.nama_divisi).border]">
                      {{ j.relawan?.divisi?.nama_divisi || 'Umum' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="jadwalHariIni.length === 0">
                   <td colspan="3" class="px-5 py-10 text-center text-slate-400 text-xs italic font-medium">Belum ada jadwal hari ini</td>
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
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import VueApexCharts from "vue3-apexcharts"; 
import { 
  BookUser, CalendarIcon, LayersIcon, PackageIcon, Store, PlusIcon, MinusIcon 
} from 'lucide-vue-next';

const apexchart = VueApexCharts;

const totalRelawan = ref(0);
const totalDivisi = ref(0);
const jadwalHariIni = ref([]);
const riwayatStok = ref([]);
const loading = ref(true);
const daftarPerKategori = ref({});

const chartSeries = ref([
  { name: 'Masuk', data: [0, 0, 0, 0, 0, 0, 0] },
  { name: 'Keluar', data: [0, 0, 0, 0, 0, 0, 0] }
]);

const chartOptions = ref({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3.5 },
  colors: ['#10b981', '#f43f5e'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] }
  },
  xaxis: {
    categories: [],
    axisBorder: { show: false },
    labels: { style: { colors: '#94a3b8', fontWeight: 800, fontSize: '9px' } }
  },
  yaxis: { show: false },
  grid: { borderColor: '#f8fafc', strokeDashArray: 5 },
  tooltip: { theme: 'light', x: { show: false } }
});

const totalJenisBarang = computed(() => Object.values(daftarPerKategori.value).flat().length);

const isStokKritis = (item) => {
  const stok = parseFloat(item.total_stok_kecil || 0);
  const limit = parseFloat(item.stok_minimum_kecil || 0);
  return stok <= limit;
};

const barangKritis = computed(() => {
  let list = [];
  if (daftarPerKategori.value) {
    Object.keys(daftarPerKategori.value).forEach(kat => {
      const kritis = daftarPerKategori.value[kat].filter(item => isStokKritis(item));
      list.push(...kritis);
    });
  }
  return list;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + 
         date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

async function loadAllData() {
  loading.value = true;
  try {
    // Penanganan Tanggal Lokal
    const hariIni = new Date();
    const formatHariIni = hariIni.toLocaleDateString('en-CA'); // Format YYYY-MM-DD

    // Ambil Data 7 Hari Terakhir
    const tujuhHariLalu = new Date();
    tujuhHariLalu.setDate(hariIni.getDate() - 6);
    tujuhHariLalu.setHours(0, 0, 0, 0);

    // 1. Data Relawan
    const { data: allRelawan } = await supabase.from('relawan').select('*, divisi!fk_divisi(nama_divisi)');
    totalRelawan.value = allRelawan?.length || 0;

    // 2. Jadwal Hari Ini
    const { data: jadwalRaw } = await supabase.from('jadwal_kerja').select('*').eq('tanggal', formatHariIni).order('jam_masuk', { ascending: true });
    if (jadwalRaw && allRelawan) {
      jadwalHariIni.value = jadwalRaw.map(j => ({
        ...j,
        relawan: allRelawan.find(rel => (j.relawan_id && rel.id === j.relawan_id) || (j.rfid_uid && rel.rfid_uid === j.rfid_uid))
      }));
    }

    // 3. Data Gudang
    const { data: dataGudang } = await supabase.from('stok_bahan').select('*, kategori:kategori_bahan(nama_kategori)');
    if (dataGudang) {
      daftarPerKategori.value = dataGudang.reduce((acc, obj) => {
        const key = obj.kategori?.nama_kategori || 'Tanpa Kategori';
        if (!acc[key]) acc[key] = [];
        acc[key].push(obj);
        return acc;
      }, {});
    }

    // 4. Riwayat Stok (PENTING: Diurutkan dari yang terbaru)
        // 4. Riwayat Stok (Sesuai nama kolom database kamu)
    const { data: dataLog, error: logError } = await supabase
      .from('riwayat_gudang') 
      .select(`
        id,
        tipe_perubahan,
        jumlah_perubahan,
        dibuat_pada,
        stok_bahan (
          nama_bahan,
         total_stok_kecil,
          created_at
        )
      `) 
      .gte('dibuat_pada', tujuhHariLalu.toISOString())
      .order('dibuat_pada', { ascending: false });

    if (logError) {
      console.error("Network Error Detail:", logError.message);
      return;
    }

    if (dataLog) {
      // A. Isi Kotak Riwayat (6 terbaru)
      riwayatStok.value = dataLog.slice(0, 6);

      // B. Olah Data Grafik (Berdasarkan dibuat_pada)
      const labelHari = [];
      const masukData = [];
      const keluarData = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(hariIni.getDate() - i);
        const formatTgl = d.toLocaleDateString('en-CA'); // "YYYY-MM-DD"
        
        labelHari.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));

        // Filter log berdasarkan kolom 'dibuat_pada'
        const logsHariIni = dataLog.filter(log => {
          const tglLog = new Date(log.dibuat_pada).toLocaleDateString('en-CA');
          return tglLog === formatTgl;
        });

        const totalMasuk = logsHariIni
          .filter(l => l.tipe_perubahan === 'Masuk')
          .reduce((sum, item) => sum + Number(item.jumlah_perubahan), 0);
          
        const totalKeluar = logsHariIni
          .filter(l => l.tipe_perubahan === 'Keluar')
          .reduce((sum, item) => sum + Number(item.jumlah_perubahan), 0);

        masukData.push(totalMasuk);
        keluarData.push(totalKeluar);
      }

      chartSeries.value = [
        { name: 'Masuk', data: masukData },
        { name: 'Keluar', data: keluarData }
      ];
      
      // Update X-Axis
      chartOptions.value = { 
        ...chartOptions.value, 
        xaxis: { ...chartOptions.value.xaxis, categories: labelHari } 
      };
    }

    const { count: countDivisi } = await supabase.from('divisi').select('*', { count: 'exact', head: true });
    totalDivisi.value = countDivisi || 0;

  } catch (e) {
    console.error("Dashboard Error:", e.message);
  } finally {
    loading.value = false;
  }
}

const getDivisiStyle = (namaDivisi) => {
  const styles = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  ];
  if (!namaDivisi) return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  let hash = 0;
  for (let i = 0; i < namaDivisi.length; i++) {
    hash = namaDivisi.charCodeAt(i) + ((hash << 5) - hash);
  }
  return styles[Math.abs(hash) % styles.length];
};

onMounted(loadAllData);
</script>
