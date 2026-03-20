<template>
  <div class="p-6 bg-slate-50 min-h-screen pb-24">
    <div class="mb-8">
<div class="mt-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-end gap-3">
  <div class="flex-1">
    <label class="text-[9px] font-black text-slate-400 uppercase ml-1">Mulai Dari</label>
    <input type="date" v-model="startDate" @change="fetchDataCustom"
           class="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none h-[38px]" />
  </div>

  <div class="flex-1">
    <label class="text-[9px] font-black text-slate-400 uppercase ml-1">Sampai Dengan</label>
    <input type="date" v-model="endDate" @change="fetchDataCustom"
           class="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none h-[38px]" />
  </div>
<div class="flex-1">
    <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-wider">Download file</label>
    <button @click="exportKeExcel" 
            class="w-full h-[40px] flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:bg-emerald-800 transition shadow-sm">
      <FileSpreadsheet :size="18" />
    </button>
  </div>
</div>


      <div class="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
        <button v-for="f in filterOptions" :key="f.val" 
                @click="currentFilter = f.val; fetchData()"
                :class="currentFilter === f.val ? 'bg-sky-600 text-white' : 'bg-white text-slate-400 border border-slate-100'"
                class="px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all shadow-sm">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-emerald-500 p-5 rounded-[2rem] text-white shadow-lg shadow-emerald-100">
        <TrendingUp :size="20" class="mb-2 opacity-80" />
        <div class="text-2xl font-black">{{ totalMasuk }}</div>
        <div class="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Barang Masuk</div>
      </div>
      <div class="bg-rose-500 p-5 rounded-[2rem] text-white shadow-lg shadow-rose-100">
        <TrendingDown :size="20" class="mb-2 opacity-80" />
        <div class="text-2xl font-black">{{ totalKeluar }}</div>
        <div class="text-[9px] font-bold uppercase tracking-widest opacity-80">Total Barang Keluar</div>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">Detail Pergerakan</h3>
        <Calendar :size="14" class="text-slate-400" />
      </div>
      
      <div class="divide-y divide-slate-50">
        <div v-if="logs.length === 0" class="p-10 text-center text-slate-300 text-xs italic">
          Tidak ada aktivitas di periode ini
        </div>
        
        <div v-for="log in logs" :key="log.id" class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="log.tipe_perubahan === 'Masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
                 class="w-10 h-10 rounded-xl flex items-center justify-center">
              <Plus v-if="log.tipe_perubahan === 'Masuk'" :size="16" />
              <Minus v-else :size="16" />
            </div>
            <div>
              <h4 class="font-bold text-slate-700 text-xs">{{ log.stok_bahan?.nama_bahan }}</h4>
              <p class="text-[9px] text-slate-400 font-medium">{{ formatTanggal(log.dibuat_pada) }}</p>
            </div>
          </div>
          <div class="text-right">
            <div :class="log.tipe_perubahan === 'Masuk' ? 'text-emerald-600' : 'text-rose-600'" class="font-black text-xs">
              {{ log.tipe_perubahan === 'Masuk' ? '+' : '-' }}{{ log.jumlah_perubahan }}
            </div>
            <p class="text-[9px] text-slate-300 italic">{{ log.keterangan || 'Tanpa ket.' }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-6 px-2">
  <button 
    @click="fetchData(currentPage - 1)" 
    :disabled="currentPage === 0 || loading"
    class="p-3 rounded-2xl bg-white border border-slate-100 disabled:opacity-30 shadow-sm text-slate-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"
  >
    <ChevronLeft :size="16" /> Sebeumnya
  </button>

  <div class="text-[10px] font-black text-slate-400 uppercase">
    Hal. {{ currentPage + 1 }} / {{ Math.ceil(totalData / itemsPerPage) }}
  </div>

  <button 
    @click="fetchData(currentPage + 1)" 
    :disabled="!hasNextPage || loading"
    class="p-3 rounded-2xl bg-white border border-slate-100 disabled:opacity-30 shadow-sm text-slate-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"
  >
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

const logs = ref([]);
const loading = ref(false); // Tambah loading state biar aman
const currentFilter = ref('hari'); 
const currentPage = ref(0);
const itemsPerPage = 10;
const totalData = ref(0);
const riwayatStok = ref([]); // Pastikan ini ada di deretan ref lainnya

const hasNextPage = computed(() => (currentPage.value + 1) * itemsPerPage < totalData.value);


const filterOptions = [
  { label: 'Hari Ini', val: 'hari' },
  { label: 'Minggu Ini', val: 'minggu' },
  { label: 'Bulan Ini', val: 'bulan' },
  { label: 'Tahun Ini', val: 'tahun' }
];

// FUNGSI UTAMA (Jangan pakai await di luar fungsi ini)
const fetchData = async (page = 0) => {
  loading.value = true;
  currentPage.value = page;

  try {
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // 1. Ambil Data dengan Range
    let query = supabase
      .from('riwayat_gudang')
      .select('*, stok_bahan(nama_bahan)', { count: 'exact' }) // Tambah count: 'exact' buat hitung total
      .order('dibuat_pada', { ascending: false })
      .range(from, to);

    // Filter tanggal (kalau ada)
    if (startDate.value && endDate.value) {
      query = query.gte('dibuat_pada', `${startDate.value}T00:00:00`)
                   .lte('dibuat_pada', `${endDate.value}T23:59:59`);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    logs.value = data || [];
    totalData.value = count || 0; // Simpan total data untuk info halaman

  } catch (err) {
    console.error(err.message);
  } finally {
    loading.value = false;
  }
};


// HITUNG OTOMATIS
const totalMasuk = computed(() => {
  return logs.value
    .filter(l => l.tipe_perubahan === 'Masuk')
    .reduce((acc, curr) => acc + (curr.jumlah_perubahan || 0), 0);
});

const totalKeluar = computed(() => {
  return logs.value
    .filter(l => l.tipe_perubahan === 'Keluar')
    .reduce((acc, curr) => acc + (curr.jumlah_perubahan || 0), 0);
});

const startDate = ref('');
const endDate = ref('');

// Fungsi untuk ambil data berdasarkan kalender
const fetchDataCustom = async () => {
  if (!startDate.value || !endDate.value) return;
  
  loading.value = true;
  currentFilter.value = 'custom'; // Tandai kalau kita pakai filter manual

  try {
    const { data, error } = await supabase
      .from('riwayat_gudang')
      .select('*, stok_bahan(nama_bahan)')
      .gte('dibuat_pada', `${startDate.value}T00:00:00`)
      .lte('dibuat_pada', `${endDate.value}T23:59:59`)
      .order('dibuat_pada', { ascending: false });

    if (error) throw error;
    logs.value = data || [];
  } catch (err) {
    console.error(err.message);
  } finally {
    loading.value = false;
  }
};


const formatTanggal = (iso) => {
  return new Date(iso).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
  });
};

const exportKeExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Opname');

  // --- 1. SETTING KOP SURAT (HEADER RESMI) ---
  worksheet.mergeCells('A1:E1');
  const title = worksheet.getCell('A1');
  title.value = 'SARANA PELAYANAN PENGADUAN GIZI (SPPG)';
  title.font = { name: 'Arial', size: 14, bold: true };
  title.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A2:E2');
  const subtitle = worksheet.getCell('A2');
  subtitle.value = 'Jl. Raya Pendidikan No. 123, Kota Bandung - Jawa Barat';
  subtitle.font = { name: 'Arial', size: 10, italic: true };
  subtitle.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A3:E3');
  worksheet.getCell('A3').value = '-----------------------------------------------------------------------------';
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A4:E4');
  const docName = worksheet.getCell('A4');
  docName.value = 'LAPORAN MUTASI STOK GUDANG';
  docName.font = { size: 12, bold: true, underline: true };
  docName.alignment = { horizontal: 'center' };

  worksheet.addRow([]); // Baris kosong

  // --- 2. HEADER TABEL ---
  const headerRow = worksheet.addRow(['Tanggal', 'Nama Bahan', 'Tipe', 'Jumlah', 'Satuan']);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0EA5E9' } // Warna Biru Sky-600
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // --- 3. INPUT DATA DARI DATABASE ---
  // Ganti 'riwayatStok.value' dengan sumber data mutasi kamu
  riwayatStok.value.forEach(item => {
    const row = worksheet.addRow([
      new Date(item.dibuat_pada).toLocaleDateString('id-ID'),
      item.stok_bahan?.nama_bahan,
      item.tipe_perubahan,
      item.jumlah_perubahan,
      item.stok_bahan?.satuan_kecil
    ]);

    // Beri warna merah jika "Keluar"
    if (item.tipe_perubahan === 'Keluar') {
      row.getCell(3).font = { color: { argb: 'FFFF0000' }, bold: true };
    }
  });

  // --- 4. TANDA TANGAN (FOOTER) ---
  worksheet.addRow([]);
  worksheet.addRow([]);
  const tglCetak = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });
  worksheet.mergeCells(`D${worksheet.lastRow.number + 1}:E${worksheet.lastRow.number + 1}`);
  worksheet.getCell(`D${worksheet.lastRow.number}`).value = `Bandung, ${tglCetak}`;
  
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.getCell(`D${worksheet.lastRow.number}`).value = '( ____________________ )';
  worksheet.getCell(`D${worksheet.lastRow.number}`).alignment = { horizontal: 'center' };
  worksheet.getCell(`D${worksheet.lastRow.number + 1}`).value = 'Kepala Gudang SPPG';
  worksheet.getCell(`D${worksheet.lastRow.number + 1}`).alignment = { horizontal: 'center' };

  // Penyesuaian lebar kolom otomatis
  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  // --- 5. GENERATE & DOWNLOAD ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Laporan_SPPG_${new Date().getTime()}.xlsx`);
};

// PANGGIL SAAT KOMPONEN MUNCUL
onMounted(() => {
  fetchData();
});
</script>

