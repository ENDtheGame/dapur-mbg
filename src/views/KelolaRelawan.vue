<template>
  <div class="p-6">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search :size="18" />
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari nama relawan..." 
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition shadow-sm text-sm"
        />
      </div>

      <router-link 
        to="/tambah-relawan" 
        class="w-full md:w-auto bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 transition flex items-center justify-center gap-2"
      >
        <Plus :size="18" /> Tambah Relawan
      </router-link>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="p-4 font-bold text-slate-600 text-sm w-16">No</th>
              <th class="p-4 font-bold text-slate-600 text-sm">Nama</th>
              <th class="p-4 font-bold text-slate-600 text-sm text-center">ID Card</th>
              <th class="p-4 font-bold text-slate-600 text-sm text-center">Alamat</th>
              <th class="p-4 font-bold text-slate-600 text-sm text-center">No Hp</th>
              <th class="p-4 font-bold text-slate-600 text-sm text-center">Divisi</th>
              <th class="p-4 font-bold text-slate-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="(relawan, index) in daftarRelawan" :key="relawan.id" class="hover:bg-slate-50 transition">
              <td class="p-4 text-sm text-slate-500 font-medium">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="p-4 font-semibold text-slate-700 text-xs">{{ relawan.nama_relawan }}</td>
              <td class="p-4 text-center font-mono text-xs text-slate-500 uppercase">{{ relawan.rfid_uid }}</td>
              <td class="p-4 text-center text-xs text-slate-600">{{ relawan.alamat }}</td>
              <td class="p-4 text-center text-xs text-slate-600">{{ relawan.no_hp }}</td>
              <td class="p-4 text-center">
                <span 
                  class="px-3 py-1 text-xs font-bold rounded-full border shadow-sm transition-all"
                  :class="[getDivisiColor(relawan.divisi?.nama_divisi).bg, getDivisiColor(relawan.divisi?.nama_divisi).text, getDivisiColor(relawan.divisi?.nama_divisi).border]"
                >
                  {{ relawan.divisi?.nama_divisi || 'Tanpa Divisi' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex justify-center gap-0.5">
                  <router-link :to="'/edit-relawan/' + relawan.id" class="p-2 text-slate-400 hover:text-sky-600 transition">
                    <Edit2 :size="16" />
                  </router-link>
                  <button @click="hapusRelawan(relawan.id, relawan.nama_relawan)" class="p-2 text-slate-400 hover:text-red-600 transition">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-100">
          <span class="text-sm text-slate-500">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 bg-white border rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50">Sebelumnya</button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-3 py-1 bg-white border rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Plus, Edit2, Trash2, Search } from 'lucide-vue-next';
import Swal from 'sweetalert2';

const daftarRelawan = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const totalData = ref(0);
const perPage = 10;
const totalPages = computed(() => Math.ceil(totalData.value / perPage));

async function fetchRelawan() {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage - 1;

  // Pastikan penulisan select relasi 'divisi(nama_divisi)' 
  // sesuai dengan foreign key yang ada di skema
  let query = supabase
  .from('relawan')
  .select('*, divisi!fk_divisi(nama_divisi)', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(start, end);

  // Jika relawan boleh tidak punya divisi, gunakan ini:
  // .select('*, divisi(nama_divisi)', { count: 'exact' })

  if (searchQuery.value) {
    query = query.ilike('nama_relawan', `%${searchQuery.value}%`);
  }

  const { data, error, count } = await query;
  console.log("Data dari Supabase:", data);
console.log("Error Supabase:", error);
  
  if (error) {
    console.error("Kesalahan Ambil Data:", error.message);
    // Jika error, set daftar kosong agar tidak loading selamanya
    daftarRelawan.value = [];
    totalData.value = 0;
  } else {
    daftarRelawan.value = data || [];
    totalData.value = count || 0;
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
  fetchRelawan();
});

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchRelawan();
  }
}

async function hapusRelawan(id, nama) { // Ganti rfid_uid jadi id
  const result = await Swal.fire({
    title: 'Hapus Relawan?',
    text: `Anda akan menghapus data ${nama}. Aksi ini tidak dapat dibatalkan!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0284c7',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    try {
      const { error } = await supabase
        .from('relawan')
        .delete()
        .eq('id', id); // Ganti rfid_uid jadi id

      if (error) throw error;

      await fetchRelawan();

      Swal.fire({
        title: 'Terhapus!',
        text: 'Data relawan berhasil dihapus.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (err) {
      Swal.fire('Gagal!', 'Terjadi kesalahan: ' + err.message, 'error');
    }
  }
}


const getDivisiColor = (namaDivisi) => {
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


onMounted(fetchRelawan);
</script>
