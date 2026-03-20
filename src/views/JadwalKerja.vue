<template>
  <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 class="font-bold text-slate-800">{{ isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru' }}</h3>
        <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600"><X :size="20" /></button>
      </div>

      <form @submit.prevent="simpanJadwal" class="p-6 space-y-4">
        <div v-if="!isEditing" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">1. Pilih Divisi</label>
            <select v-model="selectedDivisiId" class="w-full p-3 bg-slate-50 border rounded-xl text-sm">
              <option value="" disabled>-- Pilih Divisi --</option>
              <option v-for="d in daftarDivisi" :key="d.id" :value="d.id">{{ d.nama_divisi }}</option>
            </select>
          </div>

          <div v-if="selectedDivisiId" class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-bold text-slate-400 uppercase">2. Pilih Orang</label>
              <button type="button" @click="pilihSemuaRelawan" class="text-[10px] font-bold text-sky-600">PILIH SEMUA</button>
            </div>
            <div class="max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl space-y-2">
              <div v-for="r in relawanTerfilterDiModal" :key="r.rfid_uid" class="flex items-center gap-2">
                <input type="checkbox" :id="r.rfid_uid" :value="r.rfid_uid" v-model="form.relawan_ids" class="accent-sky-600" />
                <label :for="r.rfid_uid" class="text-sm text-slate-700">{{ r.nama_relawan }}</label>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <input type="time" v-model="form.jam_masuk" required class="p-3 bg-slate-50 border rounded-xl text-sm" />
          <input type="time" v-model="form.jam_pulang" required class="p-3 bg-slate-50 border rounded-xl text-sm" />
        </div>
        <textarea v-model="form.keterangan" placeholder="Keterangan..." class="w-full p-3 bg-slate-50 border rounded-xl text-sm h-20"></textarea>

        <button type="submit" class="w-full bg-sky-600 text-white py-3 rounded-xl font-bold">
          {{ isEditing ? 'Simpan Perubahan' : 'Terbitkan Jadwal' }}
        </button>
      </form>
    </div>
  </div>
  <div class="p-6">
    <div class="flex justify-between items-center mb-8">
        <button @click="bukaModalTambah" class="bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus :size="16" /> Tambah Jadwal
        </button>
      <input type="date" v-model="tanggalPilihan" class="p-3 bg-white border border-slate-200 rounded-xl text-sky-600 font-bold" />
    </div>
    <div v-if="!loading && Object.keys(jadwalPerDivisi).length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div v-for="(jadwalList, divisiNama) in jadwalPerDivisi" :key="divisiNama" 
       class="rounded-3xl p-6 shadow-sm border transition-all duration-300"
       :class="[getDivisiColor(divisiNama).bg, getDivisiColor(divisiNama).border]">
    
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3 cursor-pointer" @click="toggleDivisi(divisiNama)">
        <div class="w-2 h-6 rounded-full" :class="getDivisiColor(divisiNama).accent"></div>
        <h3 class="font-bold text-slate-800 text-lg">{{ divisiNama }}</h3>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-[10px] px-3 py-1 rounded-full font-bold shadow-sm bg-white" :class="getDivisiColor(divisiNama).text">
          {{ jadwalList.length }} Orang
        </span>
        <button @click.stop="hapusJadwalPerDivisi(divisiNama, jadwalList)" class="p-2 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors">
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <div class="space-y-3 mt-4">
      <div v-for="j in jadwalList" :key="j.id" 
           class="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
        <span class="text-sm font-medium text-slate-700">{{ j.relawan?.nama_relawan }}</span>
        
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100">
            {{ j.jam_masuk }} - {{ j.jam_pulang }}
          </span>
          <button @click="editJadwal(j)" class="text-sky-600 hover:scale-110 transition"><Edit3 :size="16" /></button>
          <button @click="hapusJadwal(j.id)" class="text-rose-500 hover:scale-110 transition"><Trash2 :size="16" /></button>
        </div>
      </div>
    </div>
  </div>
</div>

<div v-if="!loading && Object.keys(jadwalPerDivisi).length === 0">
   </div>



    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div v-for="(jadwalList, divisiNama) in jadwalPerDivisi" :key="divisiNama">
     </div>
</div>

<div v-if="Object.keys(jadwalPerDivisi).length === 0" 
     class="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm mt-4">
  <div class="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center text-sky-200 mb-6">
    <Calendar :size="48" stroke-width="1.5" />
  </div>
  <h3 class="text-slate-800 font-black text-xl">Belum Ada Jadwal</h3>
  <p class="text-slate-400 text-sm max-w-[280px] mt-2 font-medium">
    Tidak ada relawan yang dijadwalkan pada tanggal <span class="text-sky-600 font-bold">{{ tanggalPilihan }}</span>.
  </p>
  
  <button @click="bukaModalTambah" 
          class="mt-8 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-sky-100 transition active:scale-95 flex items-center gap-2">
    <Plus :size="18" />
    Buat Jadwal Sekarang
  </button>
</div>

  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { Plus, Clock, Edit3, Trash2, Calendar, X } from 'lucide-vue-next';
import Swal from 'sweetalert2';

// --- State Data ---
const tanggalPilihan = ref(new Date().toISOString().split('T')[0]);
const daftarJadwal = ref([]);
const daftarRelawanFull = ref([]);
const daftarDivisi = ref([]);
const selectedDivisiId = ref('');
const loading = ref(false);

// --- State UI/Modal ---
const isModalOpen = ref(false);
const isEditing = ref(false);
const selectedJadwalId = ref(null);

const form = ref({
  relawan_ids: [],
  tanggal: tanggalPilihan.value,
  jam_masuk: '',
  jam_pulang: '',
  keterangan: ''
});

const getDivisiColor = (namaDivisi) => {
  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', accent: 'bg-blue-500' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', accent: 'bg-emerald-500' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', accent: 'bg-amber-500' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', accent: 'bg-rose-500' },
    { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', accent: 'bg-purple-500' },
    { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', accent: 'bg-cyan-500' },
  ];

  if (!namaDivisi) return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', accent: 'bg-slate-400' };

  let hash = 0;
  for (let i = 0; i < namaDivisi.length; i++) {
    hash = namaDivisi.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// --- Logic Grouping (Sesuai Skema Gambar) ---
const jadwalPerDivisi = computed(() => {
  return daftarJadwal.value.reduce((acc, curr) => {
    // Kita cek satu-satu jalurnya
    const namaDivisi = curr.relawan?.divisi?.nama_divisi || 'Tanpa Divisi';
    
    if (!acc[namaDivisi]) acc[namaDivisi] = [];
    acc[namaDivisi].push(curr);
    return acc;
  }, {});
});

const expandedDivisi = ref({});
function toggleDivisi(nama) {
  expandedDivisi.value[nama] = !expandedDivisi.value[nama];
}

const relawanTerfilterDiModal = computed(() => {
  if (!selectedDivisiId.value) return [];
  // Filter berdasarkan divisi_id (sesuai gambar: tipe data int4)
  return daftarRelawanFull.value.filter(r => r.divisi_id === selectedDivisiId.value);
});

function pilihSemuaRelawan() {
  form.value.relawan_ids = relawanTerfilterDiModal.value.map(r => r.rfid_uid);
}

async function fetchJadwal() {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('jadwal_kerja')
      .select('*') 
      .eq('tanggal', tanggalPilihan.value)
      .order('jam_masuk', { ascending: true });

    if (error) throw error;

    if (data) {
      daftarJadwal.value = data.map(j => {
        const relawan = daftarRelawanFull.value.find(r => r.rfid_uid === j.rfid_uid || r.id === j.relawan_id);
        const divisi = daftarDivisi.value.find(d => d.id === relawan?.divisi_id);
        
        return {
          ...j,
          relawan: {
            nama_relawan: relawan?.nama_relawan || 'Tidak Dikenal',
            divisi: { 
              nama_divisi: divisi?.nama_divisi || 'Tanpa Divisi' 
            }
          }
        };
      });
    }
  } catch (error) {
    console.error("Gagal Fetch:", error.message);
  } finally {
    loading.value = false; // PINDAH KE SINI
  }
}


// FUNGSI CADANGAN: Jika Join Supabase benar-benar macet karena database berantakan
async function fetchJadwalManual() {
  const { data: jadwal } = await supabase
    .from('jadwal_kerja')
    .select('*')
    .eq('tanggal', tanggalPilihan.value);

  if (jadwal) {
    daftarJadwal.value = data.map(j => {
  // Pastikan pencocokan rfid_uid atau relawan_id akurat
  const relawan = daftarRelawanFull.value.find(r => 
    (j.rfid_uid && r.rfid_uid === j.rfid_uid) || 
    (j.relawan_id && r.id.toString() === j.relawan_id.toString())
  );

  const divisi = daftarDivisi.value.find(d => 
    d.id.toString() === relawan?.divisi_id?.toString()
  );
  
  return {
    ...j,
    relawan: {
      nama_relawan: relawan?.nama_relawan || 'Tidak Dikenal',
      divisi: { 
        nama_divisi: divisi?.nama_divisi || 'Tanpa Divisi' 
      }
    }
  };
});
  }
}



async function fetchRelawanAll() {
  const { data, error } = await supabase
    .from('relawan')
    .select('id, rfid_uid, nama_relawan, divisi_id'); // Pastikan 'id' ikut diambil
  if (!error) {
    daftarRelawanFull.value = data || [];
  }
}

async function fetchDivisi() {
  const { data } = await supabase
    .from('divisi')
    .select('id, nama_divisi'); // Pastikan ambil kolom 'id'
  daftarDivisi.value = data || []; // Harus masuk ke .value
}

// --- Actions ---
async function simpanJadwal() {
  try {
    if (isEditing.value) {
      // Update tetap sama
      const { error } = await supabase
        .from('jadwal_kerja')
        .update({
          jam_masuk: form.value.jam_masuk,
          jam_pulang: form.value.jam_pulang,
          keterangan: form.value.keterangan
        })
        .eq('id', selectedJadwalId.value);
      if (error) throw error;
    } else {
      // BAGIAN INSERT HARUS DISESUAIKAN DENGAN GAMBAR
      const dataToInsert = form.value.relawan_ids.map(uid => {
        // Cari ID integer dari relawan berdasarkan rfid_uid-nya
        const relawan = daftarRelawanFull.value.find(r => r.rfid_uid === uid);
        
        return {
          rfid_uid: uid,           // Ini kolom teks
          relawan_id: relawan?.id, // INI PENGGANTI jadwal_id (sesuai gambar skema)
          tanggal: tanggalPilihan.value,
          jam_masuk: form.value.jam_masuk,
          jam_pulang: form.value.jam_pulang,
          keterangan: form.value.keterangan
        };
      });

      const { error } = await supabase.from('jadwal_kerja').insert(dataToInsert);
      if (error) throw error;
    }
    isModalOpen.value = false;
    fetchJadwal();
    Swal.fire('Berhasil!', 'Data tersimpan', 'success');
  } catch (err) {
    Swal.fire('Gagal!', err.message, 'error');
  }
}

async function hapusJadwal(id) {
  const { isConfirmed } = await Swal.fire({
    title: 'Hapus?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya'
  });

  if (isConfirmed) {
    await supabase.from('jadwal_kerja').delete().eq('id', id);
    fetchJadwal();
  }
}

async function hapusJadwalPerDivisi(namaDivisi, listJadwal) {
  // Ambil semua ID jadwal yang ada di divisi tersebut
  const idsYangDihapus = listJadwal.map(j => j.id);

  const { isConfirmed } = await Swal.fire({
    title: `Hapus Semua Jadwal ${namaDivisi}?`,
    text: `Anda akan menghapus ${idsYangDihapus.length} jadwal sekaligus untuk tanggal ini.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48', // warna rose-600
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, Hapus Semua!',
    cancelButtonText: 'Batal'
  });

  if (isConfirmed) {
    try {
      // Gunakan operator .in() untuk menghapus banyak ID sekaligus
      const { error } = await supabase
        .from('jadwal_kerja')
        .delete()
        .in('id', idsYangDihapus);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: `Jadwal divisi ${namaDivisi} telah dibersihkan.`,
        timer: 1500,
        showConfirmButton: false
      });

      fetchJadwal(); // Refresh data
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  }
}

function bukaModalTambah() {
  isEditing.value = false;
  selectedDivisiId.value = '';
  form.value = { relawan_ids: [], jam_masuk: '', jam_pulang: '', keterangan: '' };
  isModalOpen.value = true;
}

function editJadwal(j) {
  isEditing.value = true;
  selectedJadwalId.value = j.id;
  form.value = {
    relawan_ids: [j.rfid_uid],
    jam_masuk: j.jam_masuk,
    jam_pulang: j.jam_pulang,
    keterangan: j.keterangan
  };
  isModalOpen.value = true;
}

watch(tanggalPilihan, fetchJadwal);

onMounted(async () => {
  try {
    // Jalankan satu per satu agar kita bisa lacak errornya
    const resRelawan = await supabase.from('relawan').select('id, rfid_uid, nama_relawan, divisi_id');
    if (resRelawan.error) throw new Error("Gagal ambil Relawan: " + resRelawan.error.message);
    daftarRelawanFull.value = resRelawan.data || [];

    const resDivisi = await supabase.from('divisi').select('id, nama_divisi');
    if (resDivisi.error) throw new Error("Gagal ambil Divisi: " + resDivisi.error.message);
    daftarDivisi.value = resDivisi.data || [];

    // Terakhir baru ambil jadwal
    await fetchJadwal();

  } catch (err) {
    console.error("Detail Error Mounted:", err);
    Swal.fire('Error Startup', err.message, 'error');
  }
});
</script>

