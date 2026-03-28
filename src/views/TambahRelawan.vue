<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-slate-800">Tambah Relawan Baru</h1>

    <div
      class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
    >
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm"
          >Nama Lengkap</label
        >
        <input
          v-model="form.nama_relawan"
          type="text"
          class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
          placeholder="Masukkan nama..."
        />
      </div>

      <div class="space-y-1">
        <label class="block font-semibold text-slate-700 text-sm"
          >ID RFID (UID)</label
        >
        <div class="relative group">
          <input
            v-model="form.rfid_uid"
            type="text"
            readonly
            placeholder="Silakan Tap Kartu ke Alat..."
            class="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center font-mono font-bold text-sky-600 focus:outline-none transition-all"
            :class="
              form.rfid_uid
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-sky-300 animate-pulse'
            "
          />
          <div
            v-if="form.rfid_uid"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
          >
            ✅
          </div>
        </div>
        <p class="text-[10px] text-slate-400 italic">
          UID akan terisi otomatis saat kartu didekatkan ke reader.
        </p>
      </div>
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm"
          >Alamat</label
        >
        <textarea
          v-model="form.alamat"
          class="w-full p-3 border border-slate-200 rounded-xl"
          rows="2"
        ></textarea>
      </div>
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm"
          >No. HP</label
        >
        <input
          v-model="form.no_hp"
          type="tel"
          class="w-full p-3 border border-slate-200 rounded-xl"
        />
      </div>
      <div>
        <label class="block mb-2 font-semibold text-slate-700 text-sm"
          >Divisi</label
        >
        <select
          v-model="form.divisi_id"
          class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white"
        >
          <option value="" disabled>Pilih Divisi...</option>
          <option
            v-for="divisi in daftarDivisi"
            :key="divisi.id"
            :value="divisi.id"
          >
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
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const loading = ref(false);
const daftarDivisi = ref([]);
let registerChannel = null;

const form = ref({
  nama_relawan: "",
  rfid_uid: "",
  divisi_id: "",
  alamat: "",
  no_hp: "",
});

// --- LOGIKA REALTIME DARI TABEL TEMP_REGISTER ---
const setupRealtimeScan = () => {
  registerChannel = supabase
    .channel("scan-registrasi")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "temp_register" },
      (payload) => {
        // Ambil UID terbaru yang masuk ke temp_register
        const newUID = payload.new.rfid_uid;
        form.value.rfid_uid = newUID;

        // Notifikasi kecil di pojok
        Swal.fire({
          icon: "success",
          title: "Kartu Terdeteksi",
          text: `UID: ${newUID}`,
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
      },
    )
    .subscribe();
};

async function fetchDaftarDivisi() {
  const { data, error } = await supabase
    .from("divisi")
    .select("*")
    .order("nama_divisi", { ascending: true });
  if (!error) daftarDivisi.value = data;
}

async function simpanData() {
  if (
    !form.value.nama_relawan ||
    !form.value.divisi_id ||
    !form.value.rfid_uid
  ) {
    Swal.fire({
      icon: "warning",
      title: "Data Belum Lengkap",
      text: "Pastikan Nama, Divisi, dan RFID (Scan Kartu) sudah terisi.",
      confirmButtonColor: "#0284c7",
    });
    return;
  }

  try {
    loading.value = true;
    Swal.fire({ title: "Menyimpan...", didOpen: () => Swal.showLoading() });

    // 1. Simpan ke tabel relawan
    const { error: insertError } = await supabase
      .from("relawan")
      .insert([form.value]);
    if (insertError) throw insertError;

    // 2. OPSIONAL: Bersihkan tabel temp_register agar tidak menumpuk
    await supabase
      .from("temp_register")
      .delete()
      .eq("rfid_uid", form.value.rfid_uid);

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Relawan baru telah terdaftar.",
      timer: 1500,
      showConfirmButton: false,
    });

    router.push("/kelola-relawan");
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal!", text: err.message });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDaftarDivisi();
  setupRealtimeScan();
});

onUnmounted(() => {
  if (registerChannel) supabase.removeChannel(registerChannel);
});
</script>
