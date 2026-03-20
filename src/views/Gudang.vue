<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <div class="bg-white p-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center gap-3">
        
        <button v-if="kategoriTerpilih && !searchQuery" 
                @click="kategoriTerpilih = null" 
                class="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition">
          <ChevronLeftIcon :size="20" />
        </button>

        <div class="relative flex-1 group">
          <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition" :size="20" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari barang atau kategori..."
            class="w-full pl-12 pr-12 py-4 bg-slate-100 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 ring-amber-500 transition outline-none"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
            <XIcon :size="18" />
          </button>
        </div>

        <button @click="bukaModalTambah" class="bg-amber-500 text-white p-4 rounded-2xl shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 transition">
          <PlusIcon :size="20" />
        </button>
      </div>
    </div>

    <main class="max-w-7xl mx-auto p-4 md:p-8">
      <div v-if="loading" class="text-center py-20 text-slate-400 font-bold animate-pulse">
        <PackageIcon class="mx-auto mb-2 animate-bounce" />
        Memuat Data...
      </div>

      <div v-else-if="searchQuery" class="space-y-4 animate-in fade-in duration-300">
        <div v-if="daftarFiltered.length === 0" 
             class="bg-white p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
          <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon :size="32" />
          </div>
          <h3 class="font-black text-slate-400 uppercase tracking-widest text-sm">Barang Tidak Ditemukan</h3>
          <p class="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain</p>
        </div>
        
        <div v-for="item in daftarFiltered" :key="item.id" 
             class="bg-white p-5 rounded-[2rem] shadow-sm border border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <PackageIcon :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">{{ item.nama_bahan }}</h3>
              <span class="text-[9px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-500 uppercase">
                {{ item.kategori?.nama_kategori }}
              </span>
            </div>
          </div>
          <div class="flex items-center justify-between md:justify-end gap-3">
            <div class="text-right mr-2">
              <p class="text-lg font-black text-slate-900 leading-none">{{ formatStokCanggih(item) }}</p>
              <p class="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">
                {{ item.total_stok_kecil }} {{ item.satuan_kecil?.nama_satuan }}
              </p>
            </div>
            <div class="flex gap-1">
              <button @click="bukaModalTransaksi(item, 'MASUK')" class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition"><PlusIcon :size="18" /></button>
              <button @click="bukaModalTransaksi(item, 'KELUAR')" class="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition"><MinusIcon :size="18" /></button>
              <button @click="bukaModalEdit(item)" class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition"><EditIcon :size="18" /></button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!kategoriTerpilih" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in zoom-in-95">
        <div v-for="kat in daftarKategori" :key="kat" 
             @click="kategoriTerpilih = kat"
             class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition cursor-pointer active:scale-95 group">
          <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition">
            <component :is="getIconKategori(kat)" :size="32" />
          </div>
          <span class="font-bold text-slate-700 text-sm">{{ kat }}</span>
          <span class="text-[10px] text-slate-400 font-bold mt-1 uppercase">{{ daftarPerKategori[kat]?.length || 0 }} Jenis</span>
        </div>
      </div>

      <div v-else class="space-y-4 animate-in slide-in-from-bottom-4">
        <div v-for="item in daftarPerKategori[kategoriTerpilih]" :key="item.id" 
     class="bg-white p-5 rounded-[2rem] shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4 group transition"
     :class="isStokKritis(item) ? 'border-rose-200 bg-rose-50/30' : 'border-slate-50'">
  
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition"
         :class="isStokKritis(item) ? 'bg-rose-100 text-rose-500' : 'bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500'">
      <PackageIcon :size="24" />
    </div>
    <div>
      <h3 class="font-bold" :class="isStokKritis(item) ? 'text-rose-700' : 'text-slate-800'">
        {{ item.nama_bahan }}
      </h3>
      <p v-if="isStokKritis(item)" class="text-[9px] text-rose-500 font-black uppercase tracking-widest animate-pulse">
        ⚠️ Stok Menipis!
      </p>
      <p v-else class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
        Update: {{ new Date(item.created_at).toLocaleDateString('id-ID') }}
      </p>
    </div>
  </div>

  <div class="flex items-center justify-between md:justify-end gap-3">
    <div class="text-right">
      <p class="text-lg font-black leading-none mb-1" :class="isStokKritis(item) ? 'text-rose-600' : 'text-slate-900'">
        {{ formatStokCanggih(item) }}
      </p>
      <p class="text-[10px] font-black tracking-tighter uppercase" :class="isStokKritis(item) ? 'text-rose-400' : 'text-amber-600'">
        Limit: {{ item.stok_minimum_kecil }} {{ item.satuan_kecil?.nama_satuan }}
      </p>
    </div>
    
    <div class="flex gap-1 border-l pl-4 ml-2 border-slate-100">
      <button @click="bukaModalTransaksi(item, 'MASUK')" class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition"><PlusIcon :size="18" /></button>
      <button @click="bukaModalTransaksi(item, 'KELUAR')" class="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition"><MinusIcon :size="18" /></button>
      <button @click="bukaModalEdit(item)" class="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-500 hover:text-white transition"><EditIcon :size="18" /></button>
    </div>
  </div>
</div>

      </div>
    </main>

    <div v-if="showModalTrans" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <h2 class="text-xl font-black mb-6 text-slate-800">Stok {{ tipeTrans }}</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <input v-model="formTrans.jumlah" type="number" class="w-full p-4 bg-slate-100 rounded-2xl font-bold" placeholder="Jumlah">
            <select v-model="formTrans.satuan_id" class="w-full p-4 bg-slate-100 rounded-2xl font-bold">
              <option :value="selectedBahan?.satuan_besar_id">{{ selectedBahan?.satuan_besar?.nama_satuan }}</option>
              <option :value="selectedBahan?.satuan_kecil_id">{{ selectedBahan?.satuan_kecil?.nama_satuan }}</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button @click="showModalTrans = false" class="flex-1 py-4 font-bold text-slate-400">Batal</button>
            <button @click="simpanTransaksi" class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-bold">Simpan</button>
          </div>
        </div>
      </div>
    </div>

<div v-if="showModalTambah" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
  <div class="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl my-auto">
    <h2 class="text-xl font-black mb-6 text-slate-800">{{ isEditing ? 'Edit Barang' : 'Barang Baru' }}</h2>
    
    <div class="space-y-4 text-left">
      <div>
        <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Nama Barang</label>
        <input v-model="formBahanBaru.nama_bahan" class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-amber-500" placeholder="Contoh: Beras Rojo Lele">
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Kategori</label>
        <div class="flex gap-2">
          <select v-model="formBahanBaru.kategori_id" class="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none">
            <option :value="null" disabled>-- Pilih Kategori --</option>
            <option v-for="k in daftarKategoriDB" :key="k.id" :value="k.id">{{ k.nama_kategori }}</option>
          </select>
          <button @click="tambahKategoriBaru" class="p-4 bg-amber-100 text-amber-600 rounded-2xl hover:bg-amber-500 hover:text-white transition">
            <PlusIcon :size="20" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Satuan Besar (Grosir)</label>
          <select v-model="formBahanBaru.satuan_besar_id" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none border-none">
            <option v-for="s in daftarSatuan" :key="s.id" :value="s.id">{{ s.nama_satuan }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Satuan Kecil (Unit)</label>
          <select v-model="formBahanBaru.satuan_kecil_id" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none border-none">
            <option v-for="s in daftarSatuan" :key="s.id" :value="s.id">{{ s.nama_satuan }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Isi per Satuan Besar</label>
        <div class="relative">
          <input v-model="formBahanBaru.isi_per_satuan_besar" type="number" class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-amber-500" placeholder="Contoh: 50">
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
            Unit Kecil
          </span>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 px-2 italic">
          *Misal: 1 Karung isinya <b>25</b> Kg, maka isi 25.
        </p>
      </div>
      <div>
  <label class="text-[10px] font-black text-slate-400 ml-2 uppercase block mb-1">Stok Minimum (Alarm)</label>
  <div class="relative">
    <input v-model="formBahanBaru.stok_minimum_kecil" type="number" class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-rose-500" placeholder="Contoh: 5">
    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
      {{ daftarSatuan.find(s => s.id === formBahanBaru.satuan_kecil_id)?.nama_satuan || 'Unit' }}
    </span>
  </div>
  <p class="text-[10px] text-slate-400 mt-2 px-2">
    *Sistem akan memberi warna merah jika stok menyentuh angka ini.
  </p>
</div>

      <div class="pt-4 space-y-2">
        <button @click="simpanBahanBaru" :disabled="loadingProses" class="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-200 hover:bg-amber-600 transition disabled:opacity-50">
          {{ loadingProses ? 'MEMPROSES...' : (isEditing ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN BARANG') }}
        </button>
        <button @click="showModalTambah = false" class="w-full py-2 text-slate-400 font-bold text-sm">Batal</button>
      </div>
    </div>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { 
  PackageIcon, PlusIcon, MinusIcon, ChevronLeftIcon,
  Store, Wheat, Salad, Leaf, Drumstick, Wind, Coffee, FolderIcon, EditIcon, Trash2Icon , SearchIcon, XIcon
} from 'lucide-vue-next';

// --- STATES ---
const loading = ref(true);
const loadingProses = ref(false);
const searchQuery = ref('');
const kategoriTerpilih = ref(null);
const daftarKategori = ref([]);
const daftarPerKategori = ref({});
const daftarSatuan = ref([]);
const daftarKategoriDB = ref([]);
const showModalTrans = ref(false);
const showModalTambah = ref(false);
const selectedBahan = ref(null);
const tipeTrans = ref('MASUK');
const isEditing = ref(false);

const formTrans = ref({ jumlah: null, satuan_id: null });
const formBahanBaru = ref({
  nama_bahan: '',
  kategori_id: null,
  satuan_besar_id: null,
  satuan_kecil_id: null,
  isi_per_satuan_besar: 1,
  stok_minimum_kecil: 0,
  total_stok_kecil: 0
});

// Tambahkan di bagian FUNCTIONS di script setup
const isStokKritis = (item) => {
  const stok = parseFloat(item.total_stok_kecil || 0);
  const limit = parseFloat(item.stok_minimum_kecil || 0);
  return stok <= limit;
};


const daftarFiltered = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  // Jika tidak ada pencarian, tampilkan folder seperti biasa
  if (!query) return null;

  // Jika ada pencarian, cari di semua kategori tanpa peduli folder
  let hasil = [];
  Object.keys(daftarPerKategori.value).forEach(kat => {
    const match = daftarPerKategori.value[kat].filter(item => 
      item.nama_bahan.toLowerCase().includes(query) || 
      kat.toLowerCase().includes(query)
    );
    hasil.push(...match);
  });
  return hasil;
});
// --- FUNCTIONS ---
const getIconKategori = (nama) => {
  const n = nama.toLowerCase();
  if (n.includes('sembako') || n.includes('beras')) return Wheat;
  if (n.includes('bumbu')) return Salad;
  if (n.includes('sayur')) return Leaf;
  if (n.includes('daging') || n.includes('ikan')) return Drumstick;
  if (n.includes('bersih')) return Wind;
  if (n.includes('minum')) return Coffee;
  return FolderIcon;
};

const tambahKategoriBaru = async () => {
  const { value: namaKategori } = await Swal.fire({
    title: 'Kategori Baru',
    input: 'text',
    inputLabel: 'Masukkan nama kategori baru',
    inputPlaceholder: 'Contoh: Frozen Food, Plastik, dll',
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
  });

  if (namaKategori) {
    try {
      const { data, error } = await supabase
        .from('kategori_bahan')
        .insert([{ nama_kategori: namaKategori }])
        .select();

      if (error) throw error;

      // Refresh daftar kategori di dropdown
      const { data: dataKat } = await supabase.from('kategori_bahan').select('*').order('nama_kategori');
      daftarKategoriDB.value = dataKat || [];
      
      // Otomatis pilih kategori yang baru dibuat
      formBahanBaru.value.kategori_id = data[0].id;
      
      Swal.fire('Berhasil', `Kategori ${namaKategori} telah ditambahkan`, 'success');
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  }
};


const fetchGudang = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('stok_bahan')
      .select(`*, 
        satuan_besar:satuan!satuan_besar_id(nama_satuan), 
        satuan_kecil:satuan!satuan_kecil_id(nama_satuan),
        kategori:kategori_bahan(nama_kategori)
      `)
      .order('nama_bahan');
    
    if (error) throw error;

    const grouped = data.reduce((acc, obj) => {
      const key = obj.kategori?.nama_kategori || 'Tanpa Kategori';
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
      return acc;
    }, {});
    
    daftarPerKategori.value = grouped;
    daftarKategori.value = Object.keys(grouped).sort();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatStokCanggih = (item) => {
  const total = parseFloat(item.total_stok_kecil || 0);
  const rasio = parseFloat(item.isi_per_satuan_besar || 1);
  if (total <= 0) return "Habis";
  
  const besar = Math.floor(total / rasio);
  const kecil = total % rasio;
  
  let hasil = [];
  if (besar > 0) hasil.push(`${besar} ${item.satuan_besar?.nama_satuan || ''}`);
  if (kecil > 0) hasil.push(`${kecil} ${item.satuan_kecil?.nama_satuan || ''}`);
  
  return hasil.join(' ');
};

const bukaModalTransaksi = (item, tipe) => {
  selectedBahan.value = item;
  tipeTrans.value = tipe;
  formTrans.value = { 
    jumlah: null, 
    satuan_id: tipe === 'MASUK' ? item.satuan_besar_id : item.satuan_kecil_id 
  };
  showModalTrans.value = true;
};

const hitungKonversiKeKecil = () => {
  if (!formTrans.value.jumlah || !selectedBahan.value) return 0;
  if (formTrans.value.satuan_id === selectedBahan.value.satuan_besar_id) {
    return formTrans.value.jumlah * selectedBahan.value.isi_per_satuan_besar;
  }
  return formTrans.value.jumlah;
};

const simpanTransaksi = async () => {
  if (!formTrans.value.jumlah || formTrans.value.jumlah <= 0) return;
  loadingProses.value = true;
  
  try {
    const jumlahKecil = hitungKonversiKeKecil();
    const stokLama = parseFloat(selectedBahan.value.total_stok_kecil);
    const stokBaru = tipeTrans.value === 'MASUK' 
      ? stokLama + jumlahKecil
      : stokLama - jumlahKecil;

    if (stokBaru < 0) {
      Swal.fire('Gagal', 'Stok tidak mencukupi!', 'error');
      return;
    }

    const { error: errUpdate } = await supabase
      .from('stok_bahan')
      .update({ total_stok_kecil: stokBaru })
      .eq('id', selectedBahan.value.id);

    if (errUpdate) throw errUpdate;

    await supabase.from('riwayat_gudang').insert([{
      bahan_id: selectedBahan.value.id,
      tipe_transaksi: tipeTrans.value,
      jumlah_input: formTrans.value.jumlah,
      satuan_id: formTrans.value.satuan_id,
      total_dalam_kecil: jumlahKecil
    }]);

    showModalTrans.value = false;
    await fetchGudang();
    Swal.fire({ icon: 'success', title: 'Stok Diperbarui', timer: 1000, showConfirmButton: false });
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    loadingProses.value = false;
  }
};

const bukaModalTambah = async () => {
  const { data: dataSatuan } = await supabase.from('satuan').select('*').order('nama_satuan');
  daftarSatuan.value = dataSatuan || [];
  
  const { data: dataKat } = await supabase.from('kategori_bahan').select('*').order('nama_kategori');
  daftarKategoriDB.value = dataKat || [];
  
  // Reset Form
  formBahanBaru.value = {
    nama_bahan: '', kategori_id: null, satuan_besar_id: null, 
    satuan_kecil_id: null, isi_per_satuan_besar: 1, stok_minimum_kecil: 0, total_stok_kecil: 0
  };
  
  showModalTambah.value = true;
};

const bukaModalEdit = async (item) => {
  isEditing.value = true;
  
  // Ambil data pendukung dulu (Satuan & Kategori)
  const { data: dataSatuan } = await supabase.from('satuan').select('*').order('nama_satuan');
  daftarSatuan.value = dataSatuan || [];
  const { data: dataKat } = await supabase.from('kategori_bahan').select('*').order('nama_kategori');
  daftarKategoriDB.value = dataKat || [];

  // Isi form dengan data barang yang mau diedit
  selectedBahan.value = item;
  formBahanBaru.value = {
    id: item.id, // Kita butuh ID untuk update
    nama_bahan: item.nama_bahan,
    kategori_id: item.kategori_id,
    satuan_besar_id: item.satuan_besar_id,
    satuan_kecil_id: item.satuan_kecil_id,
    isi_per_satuan_besar: item.isi_per_satuan_besar,
    stok_minimum_kecil: item.stok_minimum_kecil
  };
  
  showModalTambah.value = true;
};

// 2. Fungsi Simpan (Gabungan Tambah & Edit)
const simpanBahanBaru = async () => {
  if (!formBahanBaru.value.nama_bahan || !formBahanBaru.value.kategori_id) {
    Swal.fire('Lengkapi Data', 'Nama dan Kategori wajib diisi', 'warning');
    return;
  }
  
  loadingProses.value = true;
  try {
    if (isEditing.value) {
      // PROSES UPDATE
      const { error } = await supabase
        .from('stok_bahan')
        .update({
          nama_bahan: formBahanBaru.value.nama_bahan,
          kategori_id: formBahanBaru.value.kategori_id,
          satuan_besar_id: formBahanBaru.value.satuan_besar_id,
          satuan_kecil_id: formBahanBaru.value.satuan_kecil_id,
          isi_per_satuan_besar: formBahanBaru.value.isi_per_satuan_besar,
          stok_minimum_kecil: formBahanBaru.value.stok_minimum_kecil
        })
        .eq('id', formBahanBaru.value.id);

      if (error) throw error;
      Swal.fire('Berhasil', 'Data barang telah diperbarui', 'success');
    } else {
      // PROSES INSERT (Seperti sebelumnya)
      const { error } = await supabase.from('stok_bahan').insert([formBahanBaru.value]);
      if (error) throw error;
      Swal.fire('Berhasil', 'Barang baru ditambahkan', 'success');
    }

    showModalTambah.value = false;
    await fetchGudang();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    loadingProses.value = false;
    isEditing.value = false;
  }
};

// 3. Fungsi Hapus dengan Konfirmasi
const konfirmasiHapus = (item) => {
  Swal.fire({
    title: 'Hapus Barang?',
    text: `Yakin ingin menghapus ${item.nama_bahan}? Data riwayat juga akan terpengaruh.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { error } = await supabase
        .from('stok_bahan')
        .delete()
        .eq('id', item.id);
        
      if (!error) {
        Swal.fire('Terhapus!', 'Barang telah dibuang dari gudang.', 'success');
        fetchGudang();
      } else {
        Swal.fire('Gagal', error.message, 'error');
      }
    }
  });
};

onMounted(fetchGudang);
</script>
