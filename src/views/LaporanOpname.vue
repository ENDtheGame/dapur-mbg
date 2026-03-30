<template>
  <div class="p-6 bg-slate-50 min-h-screen pb-24">
    <div class="mb-8">
      <div class="mt-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="text-[9px] font-black text-slate-400 uppercase ml-1">Mulai Dari</label>
            <input type="date" v-model="startDate" @change="fetchData(0)"
                   class="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none h-[40px]" />
          </div>
          <div class="flex-1">
            <label class="text-[9px] font-black text-slate-400 uppercase ml-1">Sampai Dengan</label>
            <input type="date" v-model="endDate" @change="fetchData(0)"
                   class="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none h-[40px]" />
          </div>
          <button @click="exportKeExcel" 
                  class="h-[40px] px-4 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition shadow-sm">
            <FileSpreadsheet :size="18" />
          </button>
        </div>

        <div class="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          <button v-for="t in filterTipeOptions" :key="t.val"
                  @click="tipeFilter = t.val; fetchData(0)"
                  :class="tipeFilter === t.val ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'"
                  class="flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all">
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
        <button v-for="f in filterOptions" :key="f.val" 
                @click="currentFilter = f.val; applyQuickFilter(f.val)"
                :class="currentFilter === f.val ? 'bg-sky-600 text-white' : 'bg-white text-slate-400 border border-slate-100'"
                class="px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all shadow-sm">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-emerald-500 p-5 rounded-[2.5rem] text-white shadow-lg shadow-emerald-100">
        <TrendingUp :size="20" class="mb-2 opacity-80" />
         <div class="text-2xl font-black">{{ totalMasukRef }}</div>
        <div class="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Barang Masuk</div>
      </div>
      <div class="bg-rose-500 p-5 rounded-[2.5rem] text-white shadow-lg shadow-rose-100">
        <TrendingDown :size="20" class="mb-2 opacity-80" />
         <div class="text-2xl font-black">{{ totalKeluarRef }}</div>
        <div class="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Barang Keluar</div>
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm mb-10">
      <div class="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">Detail Pergerakan</h3>
        <Calendar :size="14" class="text-slate-400" />
      </div>
      
      <div class="divide-y divide-slate-50">
        <div v-if="loading" class="p-10 text-center text-slate-300 text-xs italic animate-pulse">
          Memuat data...
        </div>
        <div v-else-if="logs.length === 0" class="p-10 text-center text-slate-300 text-xs italic">
          Tidak ada aktivitas di periode ini
        </div>
        
        <!-- Ganti bagian perulangan log ini -->
<div v-for="log in logs" :key="log.id" class="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
  <div class="flex items-center gap-3">
    <!-- Ganti log.tipe_transaksi jadi log.tipe_perubahan -->
    <div :class="log.tipe_perubahan?.toUpperCase() === 'MASUK' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
         class="w-10 h-10 rounded-2xl flex items-center justify-center">
      <Plus v-if="log.tipe_perubahan?.toUpperCase() === 'MASUK'" :size="16" />
      <Minus v-else :size="16" />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <h4 class="font-bold text-slate-700 text-xs">{{ log.stok_bahan?.nama_bahan }}</h4>
        <span class="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter"
              :class="log.stok_bahan?.kategori?.tipe === 'ASET' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'">
          {{ log.stok_bahan?.kategori?.nama_kategori }}
        </span>
      </div>
      <p class="text-[9px] text-slate-400 font-medium">{{ formatTanggal(log.dibuat_pada) }}</p>
    </div>
  </div>
  
  <div class="text-right">
    <!-- Ganti log.tipe_transaksi jadi log.tipe_perubahan & total_dalam_kecil jadi jumlah_perubahan -->
    <div :class="log.tipe_perubahan?.toUpperCase() === 'MASUK' ? 'text-emerald-600' : 'text-rose-600'" class="font-black text-xs">
      {{ log.tipe_perubahan?.toUpperCase() === 'MASUK' ? '+' : '-' }}{{ log.jumlah_perubahan }}
      <span class="text-[8px] font-bold opacity-60 ml-0.5">{{ log.stok_bahan?.satuan_kecil?.nama_satuan }}</span>
    </div>
    <p v-if="log.keterangan" class="text-[8px] text-slate-400 font-medium italic mt-0.5">
      "{{ log.keterangan }}"
    </p>
  </div>
</div>


        <div class="flex items-center justify-between p-6">
          <button @click="fetchData(currentPage - 1)" :disabled="currentPage === 0 || loading"
                  class="p-3 rounded-2xl bg-white border border-slate-100 disabled:opacity-30 shadow-sm text-slate-600 font-bold text-[10px] uppercase flex items-center gap-2">
            <ChevronLeft :size="16" /> Sebelumnya
          </button>
          <div class="text-[10px] font-black text-slate-400 uppercase">
            Hal. {{ currentPage + 1 }} / {{ Math.ceil(totalData / itemsPerPage) || 1 }}
          </div>
          <button @click="fetchData(currentPage + 1)" :disabled="!hasNextPage || loading"
                  class="p-3 rounded-2xl bg-white border border-slate-100 disabled:opacity-30 shadow-sm text-slate-600 font-bold text-[10px] uppercase flex items-center gap-2">
            Selanjutnya <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TrendingUp, FileSpreadsheet, ChevronLeft, ChevronRight, TrendingDown, Calendar, Plus, Minus } from 'lucide-vue-next';

// --- STATES ---
const logs = ref([]);
const loading = ref(false);
const currentFilter = ref('hari'); 
const currentPage = ref(0);
const itemsPerPage = 10;
const totalData = ref(0);
const startDate = ref('');
const endDate = ref('');
const tipeFilter = ref('SEMUA');
const totalMasukRef = ref(0);
const totalKeluarRef = ref(0);

const filterTipeOptions = [
  { label: 'Semua', val: 'SEMUA' },
  { label: 'Bahan Dapur', val: 'KONSUMSI' },
  { label: 'Aset / Alat', val: 'ASET' }
];

const filterOptions = [
  { label: 'Hari Ini', val: 'hari' },
  { label: 'Minggu Ini', val: 'minggu' },
  { label: 'Bulan Ini', val: 'bulan' }
];

const hasNextPage = computed(() => (currentPage.value + 1) * itemsPerPage < totalData.value);

// --- FUNCTIONS ---
const fetchData = async (page = 0) => {
  loading.value = true;
  currentPage.value = page;
  const from = page * itemsPerPage;
  const to = from + itemsPerPage - 1;

  try {
    // --- 1. QUERY UNTUK LIST TABEL ---
    let query = supabase
      .from('riwayat_gudang')
      .select(`
        *,
        stok_bahan!inner (
          nama_bahan,
          kategori:kategori_bahan!inner ( nama_kategori, tipe ),
          satuan_kecil:satuan!satuan_kecil_id ( nama_satuan )
        )
      `, { count: 'exact' });

    // Filter Tanggal
    if (startDate.value && endDate.value) {
      query = query.gte('dibuat_pada', `${startDate.value}T00:00:00`)
                   .lte('dibuat_pada', `${endDate.value}T23:59:59`);
    }

    // Filter Tipe (ASET / KONSUMSI)
    if (tipeFilter.value !== 'SEMUA') {
      query = query.eq('stok_bahan.kategori.tipe', tipeFilter.value);
    }

    const { data, error, count } = await query
      .order('dibuat_pada', { ascending: false })
      .range(from, to);

    if (error) throw error;
    logs.value = data || [];
    totalData.value = count || 0;

    // --- 2. QUERY UNTUK HITUNG TOTAL (CARD) ---
    // Pastikan menggunakan nama kolom yang konsisten dengan DB (jumlah_perubahan & tipe_perubahan)
    let totalQ = supabase
      .from('riwayat_gudang')
      .select(`
        jumlah_perubahan, 
        tipe_perubahan,
        stok_bahan!inner (
          kategori:kategori_bahan!inner ( tipe )
        )
      `);

    // Filter Tanggal (Harus sama dengan query list)
    if (startDate.value && endDate.value) {
      totalQ = totalQ.gte('dibuat_pada', `${startDate.value}T00:00:00`)
                     .lte('dibuat_pada', `${endDate.value}T23:59:59`);
    }

    // Filter Tipe (Ini yang bikin angka di Card ikut berubah)
    if (tipeFilter.value !== 'SEMUA') {
      totalQ = totalQ.eq('stok_bahan.kategori.tipe', tipeFilter.value);
    }

    const { data: dataForTotal, error: errorTotal } = await totalQ;

    if (!errorTotal && dataForTotal) {
      totalMasukRef.value = dataForTotal
        .filter(l => l.tipe_perubahan?.toUpperCase() === 'MASUK')
        .reduce((acc, curr) => acc + Number(curr.jumlah_perubahan || 0), 0);

      totalKeluarRef.value = dataForTotal
        .filter(l => l.tipe_perubahan?.toUpperCase() === 'KELUAR')
        .reduce((acc, curr) => acc + Number(curr.jumlah_perubahan || 0), 0);
    }

  } catch (err) {
    console.error("Gagal load data mutasi:", err.message);
  } finally {
    loading.value = false;
  }
};

const applyQuickFilter = (val) => {
  const now = new Date();
  let start = new Date();
  
  if (val === 'hari') start.setHours(0,0,0,0);
  if (val === 'minggu') start.setDate(now.getDate() - 7);
  if (val === 'bulan') start.setMonth(now.getMonth() - 1);

  startDate.value = start.toISOString().split('T')[0];
  endDate.value = now.toISOString().split('T')[0];
  fetchData(0);
};

const formatTanggal = (iso) => {
  return new Date(iso).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
  });
};

const exportKeExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Mutasi');

  // --- 1. SETTING KOP SURAT (Tetap sama) ---
  worksheet.mergeCells('A1:G1'); // Ubah ke G karena ada 7 kolom
  const title = worksheet.getCell('A1');
  title.value = 'SARANA PELAYANAN PENGADUAN GIZI (SPPG)';
  title.font = { name: 'Arial', size: 14, bold: true };
  title.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A2:G2');
  const subtitle = worksheet.getCell('A2');
  subtitle.value = 'Jl. Raya Pendidikan No. 123, Kota Bandung - Jawa Barat';
  subtitle.font = { name: 'Arial', size: 10, italic: true };
  subtitle.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A3:G3');
  worksheet.getCell('A3').value = '====================================================================================';

  worksheet.addRow([]); 

  // --- 2. HEADER TABEL (Ada 7 Kolom) ---
  const headerRow = worksheet.addRow([
    'Tanggal',        // Kolom 1
    'Nama Bahan',     // Kolom 2
    'Kategori',       // Kolom 3
    'Tipe Mutasi',    // Kolom 4 (MASUK/KELUAR)
    'Jumlah',         // Kolom 5
    'Satuan',         // Kolom 6
    'Keterangan'      // Kolom 7
  ]);
  
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  });

  // --- 3. INPUT DATA (HARUS PAS 7 KOLOM) ---
  // --- 3. INPUT DATA (SINKRONKAN DENGAN NAMA KOLOM BARU) ---
logs.value.forEach(item => {
  const row = worksheet.addRow([
    new Date(item.dibuat_pada).toLocaleDateString('id-ID'),    // 1. Tanggal
    item.stok_bahan?.nama_bahan || '-',                       // 2. Nama
    item.stok_bahan?.kategori?.nama_kategori || '-',          // 3. Kategori
    item.tipe_perubahan || '-',                               // 4. TIPE MUTASI (Ganti dari tipe_transaksi)
    item.jumlah_perubahan || 0,                               // 5. JUMLAH (Ganti dari total_dalam_kecil)
    item.stok_bahan?.satuan_kecil?.nama_satuan || '-',        // 6. Satuan
    item.keterangan || '-'                                    // 7. Keterangan
  ]);

  // Beri Warna di kolom ke-4 (Tipe Mutasi: Masuk/Keluar)
  const cellTipe = row.getCell(4);
  // Gunakan toUpperCase supaya pengecekan tidak error karena beda huruf besar/kecil
  const tipe = (item.tipe_perubahan || '').toUpperCase();
  
  if (tipe === 'KELUAR') {
    cellTipe.font = { color: { argb: 'FFFF0000' }, bold: true }; // Merah
  } else if (tipe === 'MASUK') {
    cellTipe.font = { color: { argb: 'FF059669' }, bold: true }; // Hijau
  }

  // Border untuk semua sel di baris ini
  row.eachCell((cell) => {
    cell.border = { 
      top: {style:'thin'}, 
      left: {style:'thin'}, 
      bottom: {style:'thin'}, 
      right: {style:'thin'} 
    };
  });
});


  // --- 4. TANDA TANGAN ---
  worksheet.addRow([]);
  const lastR = worksheet.lastRow.number;
  const tglCetak = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });
  
  worksheet.mergeCells(`F${lastR + 2}:G${lastR + 2}`);
  worksheet.getCell(`F${lastR + 2}`).value = `Bandung, ${tglCetak}`;
  worksheet.getCell(`F${lastR + 2}`).alignment = { horizontal: 'center' };

  worksheet.mergeCells(`F${lastR + 6}:G${lastR + 6}`);
  worksheet.getCell(`F${lastR + 6}`).value = '( ____________________ )';
  worksheet.getCell(`F${lastR + 6}`).alignment = { horizontal: 'center' };

  // Lebar kolom otomatis
  worksheet.columns.forEach(column => {
    column.width = 18;
  });

  // --- 5. DOWNLOAD ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Laporan_Gudang_SPPG_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  applyQuickFilter('hari');
});
</script>
