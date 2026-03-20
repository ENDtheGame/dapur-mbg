<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-slate-800">Tambah Relawan Baru</h1>
    
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">Nama Lengkap</label>
        <input v-model="form.nama_relawan" type="text" class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Masukkan nama..." />
      </div>
      
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">ID RFID (UID)</label>
        <input v-model="form.rfid_uid" type="text" class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Masukkan ID kartu..." />
      </div>
      <div>
  <label class="block mb-2 font-semibold text-slate-700 text-sm">Alamat</label>
  <textarea v-model="form.alamat" class="w-full p-3 border border-slate-200 rounded-xl" rows="2"></textarea>
</div>
<div>
  <label class="block mb-2 font-semibold text-slate-700 text-sm">No. HP</label>
  <input v-model="form.no_hp" type="tel" class="w-full p-3 border border-slate-200 rounded-xl" />
</div>
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">Divisi</label>
        <select v-model="form.divisi_id" class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white">
          <option value="" disabled>Pilih Divisi...</option>
          <option v-for="divisi in daftarDivisi" :key="divisi.id" :value="divisi.id">
            {{ divisi.nama_divisi }}
          </option>
        </select>
      </div>

      <button 
        @click="simpanData" 
        class="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition mt-4"
      >
        Simpan Relawan
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // Pastikan sudah import Swal

const router = useRouter();
const loading = ref(false); // Variabel loading didefinisikan di sini
const daftarDivisi = ref([]);

const form = ref({
  nama_relawan: '',
  rfid_uid: '',
  divisi_id: '',
  alamat: '',
  no_hp: ''
});

async function fetchDaftarDivisi() {
  const { data, error } = await supabase
    .from('divisi')
    .select('*')
    .order('nama_divisi', { ascending: true });
  if (!error) daftarDivisi.value = data;
}

async function simpanData() {
  if (!form.value.nama_relawan || !form.value.divisi_id || !form.value.rfid_uid) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops!',
      text: 'Mohon isi semua kolom yang tersedia!',
      confirmButtonColor: '#0284c7'
    });
    return;
  }

  try {
    loading.value = true;
    
    // Tampilkan loading saat proses kirim ke Supabase
    Swal.fire({
      title: 'Menyimpan...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const { error } = await supabase.from('relawan').insert([form.value]);
    if (error) throw error;

    // Sukses! Tutup loading dan tampilkan notifikasi sukses
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Relawan baru telah ditambahkan.',
      timer: 1500,
      showConfirmButton: false
    });

    router.push('/kelola-relawan');
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Terjadi kesalahan: ' + err.message,
      confirmButtonColor: '#e11d48'
    });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDaftarDivisi);
</script>
