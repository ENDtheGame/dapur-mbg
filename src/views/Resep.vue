<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- HEADER -->
    <main class="max-w-4xl mx-auto p-4 space-y-6">
      
      <!-- TOMBOL TAMBAH MENU BARU -->
      <button @click="bukaModalMenu" 
              class="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-black shadow-lg hover:bg-slate-700 transition flex items-center justify-center gap-2">
        <PlusIcon :size="20" />
        BUAT PAKET MENU BARU
      </button>

      <!-- LIST MENU YANG SUDAH ADA -->
      <div v-if="loading" class="text-center py-10 text-slate-400 font-bold animate-pulse">Memuat Menu...</div>
      
      <div v-else class="grid gap-4">
        <div v-for="menu in daftarMenu" :key="menu.id" 
             class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 group">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-black text-slate-800">{{ menu.nama_menu }}</h3>
              <p class="text-xs text-slate-400">{{ menu.keterangan || 'Tanpa keterangan' }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="hapusMenu(menu)" class="p-2 text-slate-300 hover:text-rose-500 transition">
                <Trash2Icon :size="18" />
              </button>
            </div>
          </div>

          <!-- DAFTAR ISI RESEP -->
          <div class="bg-slate-50 rounded-3xl p-4 space-y-2">
            <div class="flex justify-between items-center mb-2 px-1">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Komposisi Bahan</span>
              <button @click="tambahBahanKeResep(menu)" class="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-500 hover:text-white transition">
                + BAHAN
              </button>
            </div>

            <div v-if="menu.resep_menu?.length === 0" class="text-center py-4 text-[10px] text-slate-300 italic">
              Belum ada bahan. Klik + BAHAN untuk menyusun.
            </div>

            <div v-for="item in menu.resep_menu" :key="item.id" 
                 class="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <PackageIcon :size="14" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-700">{{ item.stok_bahan?.nama_bahan }}</p>
                  <p class="text-[9px] text-slate-400 font-medium">Isi: {{ item.qty_per_porsi }} / Porsi</p>
                </div>
              </div>
              <button @click="hapusItemResep(item.id)" class="p-1.5 text-slate-300 hover:text-rose-500">
                <XIcon :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL TAMBAH MENU -->
    <div v-if="showModalMenu" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
        <h2 class="text-xl font-black mb-6 text-slate-800">Paket Menu Baru</h2>
        <div class="space-y-4">
          <input v-model="formMenu.nama_menu" placeholder="Nama Menu (Misal: Paket A)" 
                 class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-amber-500">
          <textarea v-model="formMenu.keterangan" placeholder="Keterangan singkat..." 
                    class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-amber-500"></textarea>
          <div class="flex gap-2">
            <button @click="showModalMenu = false" class="flex-1 py-4 font-bold text-slate-400">Batal</button>
            <button @click="simpanMenu" class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black">SIMPAN</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH BAHAN KE RESEP -->
    <div v-if="showModalBahan" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
        <h2 class="text-xl font-black mb-1 text-slate-800">Pilih Bahan</h2>
        <p class="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest">Menu: {{ selectedMenu?.nama_menu }}</p>
        
        <div class="space-y-4">
          <select v-model="formResep.bahan_id" class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none">
            <option :value="null">-- Pilih Bahan dari Gudang --</option>
            <option v-for="b in daftarSemuaBahan" :key="b.id" :value="b.id">
              {{ b.nama_bahan }} (Stok: {{ b.total_stok_kecil }})
            </option>
          </select>
          
          <div>
            <label class="text-[10px] font-black text-slate-400 ml-2 mb-1 block">JUMLAH PER PORSI</label>
            <div class="relative">
              <input v-model="formResep.qty_per_porsi" type="number" 
                     class="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 ring-amber-500">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                {{ getSatuanKecil(formResep.bahan_id) }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button @click="showModalBahan = false" class="flex-1 py-4 font-bold text-slate-400">Batal</button>
            <button @click="simpanBahanResep" class="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-200">TAMBAHKAN</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { PlusIcon, Trash2Icon, PackageIcon, XIcon } from 'lucide-vue-next';

// --- STATES ---
const loading = ref(false);
const daftarMenu = ref([]);
const daftarSemuaBahan = ref([]);
const showModalMenu = ref(false);
const showModalBahan = ref(false);
const selectedMenu = ref(null);

const formMenu = ref({ nama_menu: '', keterangan: '' });
const formResep = ref({ bahan_id: null, qty_per_porsi: 1 });

// --- FUNCTIONS ---
const fetchMenu = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('master_menu')
    .select(`*, resep_menu(*, stok_bahan(nama_bahan, satuan_kecil:satuan!satuan_kecil_id(nama_satuan)))`)
    .order('dibuat_pada', { ascending: false });
  
  if (!error) daftarMenu.value = data;
  loading.value = false;
};

const fetchBahan = async () => {
  const { data } = await supabase.from('stok_bahan').select('*, satuan_kecil:satuan!satuan_kecil_id(*)').order('nama_bahan');
  daftarSemuaBahan.value = data || [];
};

const bukaModalMenu = () => {
  formMenu.value = { nama_menu: '', keterangan: '' };
  showModalMenu.value = true;
};

const simpanMenu = async () => {
  if (!formMenu.value.nama_menu) {
    Swal.fire('Opps', 'Nama menu tidak boleh kosong', 'warning');
    return;
  }
  
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('master_menu')
      .insert([{
        nama_menu: formMenu.value.nama_menu,
        keterangan: formMenu.value.keterangan
      }])
      .select();

    if (error) throw error;

    showModalMenu.value = false;
    await fetchMenu(); // Refresh list
    Swal.fire({ icon: 'success', title: 'Menu Berhasil Dibuat', timer: 1000, showConfirmButton: false });
  } catch (err) {
    console.error("Error Simpan Menu:", err.message);
    Swal.fire('Gagal Simpan', err.message, 'error');
  } finally {
    loading.value = false;
  }
};


const tambahBahanKeResep = (menu) => {
  selectedMenu.value = menu;
  formResep.value = { bahan_id: null, qty_per_porsi: 1 };
  showModalBahan.value = true;
};

const simpanBahanResep = async () => {
  // 1. Validasi Input di awal
  if (!formResep.value.bahan_id || formResep.value.qty_per_porsi <= 0) {
    Swal.fire('Data Tidak Valid', 'Pilih bahan dan pastikan jumlah lebih dari 0', 'warning');
    return;
  }

  loading.value = true;
  try {
    // 2. Kirim data ke Supabase
    const { error } = await supabase
      .from('resep_menu')
      .insert([{
        menu_id: selectedMenu.value.id,
        bahan_id: Number(formResep.value.bahan_id), // PAKSA JADI ANGKA
        qty_per_porsi: parseFloat(formResep.value.qty_per_porsi) // PAKSA JADI DESIMAL
      }]);

    if (error) throw error;

    // 3. Jika Berhasil
    showModalBahan.value = false;
    await fetchMenu(); // Refresh tampilan agar bahan muncul di kartu menu
    Swal.fire({ 
      icon: 'success', 
      title: 'Bahan Berhasil Ditambahkan', 
      timer: 1500, 
      showConfirmButton: false 
    });

  } catch (err) {
    // 4. Jika Gagal, Munculkan Pesan Error Spesifik
    console.error("Detail Error:", err);
    Swal.fire('Gagal Menambahkan', `Penyebab: ${err.message}`, 'error');
  } finally {
    loading.value = false;
  }
};


const hapusItemResep = async (id) => {
  await supabase.from('resep_menu').delete().eq('id', id);
  fetchMenu();
};

const hapusMenu = async (menu) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Hapus Menu?',
    text: `Seluruh resep untuk ${menu.nama_menu} akan ikut terhapus.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444'
  });

  if (isConfirmed) {
    await supabase.from('master_menu').delete().eq('id', menu.id);
    fetchMenu();
  }
};

const getSatuanKecil = (id) => {
  const bahan = daftarSemuaBahan.value.find(b => b.id === id);
  return bahan?.satuan_kecil?.nama_satuan || 'Pcs';
};

onMounted(() => {
  fetchMenu();
  fetchBahan();
});
</script>
