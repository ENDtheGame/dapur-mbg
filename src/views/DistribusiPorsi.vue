<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- HEADER -->

    <main class="max-w-2xl mx-auto p-4 space-y-6">
      
      <!-- STEP 1: PILIH MENU & JUMLAH -->
      <div class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 ml-2 mb-1 block uppercase">Pilih Paket Menu</label>
          <select v-model="selectedMenuId" @change="loadResep" class="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-amber-500 text-slate-700">
            <option :value="null">-- Pilih Menu Resep --</option>
            <option v-for="m in daftarMenu" :key="m.id" :value="m.id">{{ m.nama_menu }}</option>
          </select>
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 ml-2 mb-1 block uppercase">Jumlah Porsi (Target)</label>
          <input v-model.number="jumlahPorsi" type="number" placeholder="Contoh: 2000" 
                 class="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-black text-slate-800 outline-none focus:ring-2 ring-amber-500">
        </div>
      </div>

      <!-- STEP 2: HASIL KALKULASI -->
      <div v-if="resepTerpilih.length > 0" class="space-y-3">
        <div class="flex justify-between items-center px-2">
          <h2 class="text-xs font-black text-slate-500 uppercase">Estimasi Pengambilan Barang</h2>
          <span class="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase">Otomatis</span>
        </div>

        <div v-for="item in hasilKalkulasi" :key="item.id" 
             class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <PackageIcon :size="18" />
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm">{{ item.nama }}</h4>
              <p class="text-[10px] text-slate-400 font-medium italic">
                Stok Saat Ini: {{ item.stokSekarang }} {{ item.satuanKecil }}
              </p>
            </div>
          </div>
          
          <div class="text-right">
            <!-- KONVERSI KE SATUAN BESAR -->
            <div class="text-lg font-black" :class="item.stokSekarang < item.totalButuh ? 'text-rose-500' : 'text-emerald-600'">
              {{ item.totalBesar }} {{ item.satuanBesar }}
            </div>
            <div class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              (= {{ item.totalButuh }} {{ item.satuanKecil }})
            </div>
          </div>
        </div>

        <!-- TOMBOL EKSEKUSI -->
        <button @click="eksekusiPotongStok" :disabled="isProcessing"
                class="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:bg-slate-300 disabled:shadow-none uppercase tracking-widest flex items-center justify-center gap-3">
          <span v-if="isProcessing" class="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span>
          {{ isProcessing ? 'Memproses Stok...' : 'Konfirmasi & Potong Stok' }}
        </button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { PackageIcon } from 'lucide-vue-next';

const daftarMenu = ref([]);
const selectedMenuId = ref(null);
const jumlahPorsi = ref(0);
const resepTerpilih = ref([]);
const isProcessing = ref(false);

const fetchDaftarMenu = async () => {
  const { data } = await supabase.from('master_menu').select('*').order('nama_menu');
  daftarMenu.value = data || [];
};

const loadResep = async () => {
  if (!selectedMenuId.value) {
    resepTerpilih.value = [];
    return;
  }
  // Ambil data resep beserta info konversi dari stok_bahan
  const { data } = await supabase
    .from('resep_menu')
    .select(`
      qty_per_porsi,
      stok_bahan (
        id, nama_bahan, total_stok_kecil, isi_per_satuan_besar, 
        satuan_besar:satuan!satuan_besar_id(nama_satuan),
        satuan_kecil:satuan!satuan_kecil_id(nama_satuan)
      )
    `)
    .eq('menu_id', selectedMenuId.value);
  
  resepTerpilih.value = data || [];
};

// LOGIKA KALKULATOR OTOMATIS
const hasilKalkulasi = computed(() => {
  return resepTerpilih.value.map(r => {
    const totalButuh = r.qty_per_porsi * (jumlahPorsi.value || 0);
    const isi = r.stok_bahan.isi_per_satuan_besar || 1;
    const totalBesar = Math.ceil(totalButuh / isi); // Pembulatan ke atas

    return {
      id: r.stok_bahan.id,
      nama: r.stok_bahan.nama_bahan,
      totalButuh: totalButuh,
      totalBesar: totalBesar,
      satuanBesar: r.stok_bahan.satuan_besar?.nama_satuan || 'Unit',
      satuanKecil: r.stok_bahan.satuan_kecil?.nama_satuan || 'Pcs',
      stokSekarang: r.stok_bahan.total_stok_kecil
    };
  });
});

// FUNGSI POTONG STOK MASSAL
const eksekusiPotongStok = async () => {
  if (jumlahPorsi.value <= 0) return;

  const { isConfirmed } = await Swal.fire({
    title: 'Konfirmasi Distribusi',
    text: `Stok untuk ${jumlahPorsi.value} porsi akan dipotong. Lanjutkan?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluarkan Barang',
    confirmButtonColor: '#059669'
  });

  if (!isConfirmed) return;

  isProcessing.value = true;
  try {
    for (const item of hasilKalkulasi.value) {
      // 1. Update Stok di Tabel stok_bahan
      const stokBaru = item.stokSekarang - item.totalButuh;
      const { error: errUpdate } = await supabase
        .from('stok_bahan')
        .update({ total_stok_kecil: stokBaru })
        .eq('id', item.id);
      
      if (errUpdate) throw errUpdate;

      // 2. Catat ke Riwayat Gudang
      await supabase.from('riwayat_gudang').insert([{
        bahan_id: item.id,
        tipe_transaksi: 'KELUAR',
        total_dalam_kecil: item.totalButuh,
        keterangan: `Distribusi Massal: ${jumlahPorsi.value} Porsi`
      }]);
    }

    // 3. Catat ke Distribusi Log
    await supabase.from('distribusi_log').insert([{
      menu_id: selectedMenuId.value,
      jumlah_porsi: jumlahPorsi.value
    }]);

    Swal.fire('Berhasil!', 'Stok gudang telah terupdate.', 'success');
    jumlahPorsi.value = 0;
    loadResep(); // Refresh data stok

  } catch (err) {
    Swal.fire('Gagal!', err.message, 'error');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(fetchDaftarMenu);
</script>
