<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // <--- TADI BELUM ADA 'useRouter'
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

const router = useRouter(); // Sekarang ini akan berfungsi
const route = useRoute(); 
const rfid = route.params.id;

const form = ref({ nama_relawan: '', divisi_id: '', rfid_uid: '' }); // Tambahkan rfid_uid di sini
const daftarDivisi = ref([]);
const loading = ref(false);

async function fetchDaftarDivisi() {
  const { data, error } = await supabase.from('divisi').select('*');
  if (!error) daftarDivisi.value = data;
}

// Ganti bagian pengambilan parameter agar lebih jelas
const relawanId = route.params.id; // Ini menangkap ID integer dari URL

async function fetchRelawanDetail() {
  const { data, error } = await supabase
    .from('relawan')
    .select('*')
    .eq('id', relawanId) // Cari berdasarkan id (Primary Key)
    .single();

  if (data) {
    form.value = data;
  } else if (error) {
    console.error("Gagal ambil detail:", error.message);
  }
}

async function updateData() {
  loading.value = true;
  try {
    const { error } = await supabase
      .from('relawan')
      .update({ 
        nama_relawan: form.value.nama_relawan,
        divisi_id: form.value.divisi_id,
        rfid_uid: form.value.rfid_uid, // UID kartu tetap bisa diedit
        alamat: form.value.alamat,
        no_hp: form.value.no_hp
      })
      .eq('id', relawanId); // Update berdasarkan id, bukan rfid_uid

    if (error) throw error;

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Data relawan telah diperbarui.',
      timer: 1500,
      showConfirmButton: false
    });

    router.push('/kelola-relawan'); 

  } catch (err) {
    Swal.fire('Terjadi Kesalahan', err.message, 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDaftarDivisi();
  fetchRelawanDetail();
});
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-slate-800">Edit Relawan</h1>
    
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">Nama Lengkap</label>
        <input v-model="form.nama_relawan" type="text" class="w-full p-3 border border-slate-200 rounded-xl" placeholder="Masukkan nama..." />
      </div>
      
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">ID RFID (UID)</label>
        <input v-model="form.rfid_uid" type="text" class="w-full p-3 border border-slate-200 rounded-xl" placeholder="Masukkan ID kartu..." />
      </div>

      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm">Divisi</label>
        <select v-model="form.divisi_id" class="w-full p-3 border border-slate-200 rounded-xl bg-white">
          <option value="" disabled>Pilih Divisi...</option>
          <option v-for="divisi in daftarDivisi" :key="divisi.id" :value="divisi.id">
            {{ divisi.nama_divisi }}
          </option>
        </select>
      </div>
      <div>
  <label class="block mb-2 font-semibold text-slate-700 text-sm">Alamat</label>
  <textarea v-model="form.alamat" class="w-full p-3 border border-slate-200 rounded-xl" rows="2"></textarea>
</div>
<div>
  <label class="block mb-2 font-semibold text-slate-700 text-sm">No. HP</label>
  <input v-model="form.no_hp" type="tel" class="w-full p-3 border border-slate-200 rounded-xl" />
</div>
      <button 
        @click="updateData" 
        :disabled="loading"
        class="bg-sky-600 text-white px-6 py-2 rounded-xl hover:bg-sky-700 transition"
      >
        {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </button>
    </div>
  </div>
</template>
