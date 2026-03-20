<template>
  <button @click="isOpen = !isOpen" 
          class="fixed bottom-6 right-6 w-14 h-14 bg-sky-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50">
    <MessageCircle v-if="!isOpen" :size="28" />
    <X v-else :size="28" />
  </button>

  <div v-if="isOpen" 
       class="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4">
    
    <div class="bg-sky-600 p-5 text-white">
      <h3 class="font-black flex items-center gap-2 text-sm uppercase tracking-widest">
        <Sparkles :size="16" /> Asisten Dapur AI
      </h3>
      <p class="text-[10px] opacity-80 font-medium">Tanya jadwal atau rekap kehadiran hari ini</p>
    </div>

    <div class="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-slate-50" id="chatbox">
      <div v-for="(msg, i) in chatHistory" :key="i" 
           :class="msg.role === 'user' ? 'text-right' : 'text-left'">
        <div :class="msg.role === 'user' ? 'bg-sky-600 text-white ml-auto' : 'bg-white text-slate-700 border border-slate-100'"
             class="inline-block p-3 rounded-2xl text-xs font-medium max-w-[80%] shadow-sm">
          {{ msg.text }}
        </div>
      </div>
      <div v-if="loading" class="text-left">
        <div class="bg-white p-3 rounded-2xl text-xs border border-slate-100 animate-pulse text-slate-400">Sedang berpikir...</div>
      </div>
    </div>

    <div class="p-4 bg-white border-t border-slate-50 flex gap-2">
      <input v-model="userInput" @keyup.enter="handleKirim"
             placeholder="Siapa yang absen hari ini?" 
             class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
      <button @click="handleKirim" :disabled="loading"
              class="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition disabled:opacity-50">
        <Send :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MessageCircle, X, Send, Sparkles } from 'lucide-vue-next';
import { supabase } from '../lib/supabaseClient';

const isOpen = ref(false);
const loading = ref(false);
const userInput = ref('');
const chatHistory = ref([
  { role: 'ai', text: 'Halo Bos! Ada yang bisa saya bantu?' }
]);

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


async function handleKirim() {
  if (!userInput.value.trim() || loading.value) return;

  const userMsg = userInput.value;
  chatHistory.value.push({ role: 'user', text: userMsg });
  userInput.value = '';
  loading.value = true;

  try {
    const hariIni = new Date().toLocaleDateString('en-CA');
    const tujuhHariLalu = new Date();
    tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

    // 1. TARIK DATA (Update: Tambahkan Riwayat Gudang)
    const [resAbsen, resStok, resJadwal, resMutasi] = await Promise.all([
      supabase.from('absensi_relawan').select('status_absensi, relawan(nama_relawan)').gte('waktu_tap', hariIni),
      supabase.from('stok_bahan').select('*'),
      supabase.from('jadwal_kerja').select('*, relawan(nama_relawan)').eq('tanggal', hariIni),
      supabase.from('riwayat_gudang').select('*, stok_bahan(nama_bahan)').gte('dibuat_pada', tujuhHariLalu.toISOString()).order('dibuat_pada', { ascending: false })
    ]);

    // 2. KELOLA DATA MUTASI (Biar AI paham tren)
    const ringkasanMutasi = resMutasi.data?.map(m => 
      `[${m.tipe_perubahan}] ${m.stok_bahan?.nama_bahan}: ${m.jumlah_perubahan} (${new Date(m.dibuat_pada).toLocaleDateString('id-ID')})`
    ).slice(0, 15); // Ambil 15 riwayat terakhir saja biar hemat token

    const dataUntukAI = {
      absen: resAbsen.data?.map(a => `${a.relawan?.nama_relawan} (${a.status_absensi})`) || [],
      stok: resStok.data?.map(s => `${s.nama_bahan}: ${s.total_stok_kecil} ${s.satuan_kecil}`) || [],
      jadwal: resJadwal.data?.map(j => j.relawan?.nama_relawan) || [],
      mutasi: ringkasanMutasi || []
    };

    // 3. RAKIT PROMPT (Berikan AI kemampuan analisa tren)
    const instruksi = `
      Kamu adalah Manajer Dapur Digital yang cerdas dan teliti.
      DATA REAL-TIME GUDANG:
      - Stok Saat Ini: ${dataUntukAI.stok.join(', ')}
      - Mutasi 7 Hari Terakhir: ${dataUntukAI.mutasi.join(' | ')}
      - Jadwal Hari Ini: ${dataUntukAI.jadwal.join(', ')}
      - Absensi: ${dataUntukAI.absen.join(', ')}

      TUGAS: 
      1. Jawab pertanyaan admin dengan data di atas.
      2. Jika admin tanya soal "stok habis" atau "tren", analisa data Mutasi.
      3. Gunakan bahasa yang ramah, singkat, dan profesional ala asisten dapur. 🍳
      
      PERTANYAAN ADMIN: ${userMsg}
    `;

    // 4. KIRIM KE GEMINI (Gunakan model yang tersedia di API kamu, ganti ke flash-2.0 jika perlu)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruksi }] }]
      })
    });

    const result = await response.json();
    const aiResponse = result.candidates[0].content.parts[0].text;
    chatHistory.value.push({ role: 'ai', text: aiResponse });

  } catch (err) {
    console.error(err);
    chatHistory.value.push({ role: 'ai', text: "Waduh Bos, sepertinya kabel otak saya agak kendor. Coba tanya lagi ya!" });
  } finally {
    loading.value = false;
  }
}
</script>
