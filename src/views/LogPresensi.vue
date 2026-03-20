<template>
    <main class="p-6 md:p-10 bg-slate-50 min-h-screen pb-24 text-left">
        <div class="max-w-4xl mx-auto space-y-8">
            <section
                class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
            >
                <div class="flex items-center gap-4 mb-6">
                    <div
                        class="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600"
                    >
                        <Rss :size="24" />
                    </div>
                    <div class="text-left">
                        <h2 class="font-black text-slate-800 text-lg">
                            Input Presensi Manual
                        </h2>
                        <p
                            class="text-slate-400 text-xs font-medium uppercase tracking-wider"
                        >
                            Simulasi Mesin RFID
                        </p>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4">
                    <input
                        v-model="inputUid"
                        placeholder="KETIK UID KARTU..."
                        class="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center text-xl uppercase tracking-widest focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        @keyup.enter="simulasiTap('Masuk')"
                    />
                    <div class="flex gap-2">
                        <button
                            @click="simulasiTap('Masuk')"
                            :disabled="!inputUid"
                            class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition active:scale-95 disabled:opacity-50"
                        >
                            MASUK
                        </button>
                        <button
                            @click="simulasiTap('Pulang')"
                            :disabled="!inputUid"
                            class="bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-2xl font-bold transition active:scale-95 disabled:opacity-50"
                        >
                            PULANG
                        </button>
                    </div>
                </div>
            </section>

            <section
                class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
                <div
                    class="p-6 border-b border-slate-50 flex justify-between items-center"
                >
                    <h3 class="font-black text-slate-800 tracking-tight">
                        Aktivitas Terkini
                    </h3>
                    <span
                        class="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase"
                        >Real-time Update</span
                    >
                </div>

                <div class="divide-y divide-slate-50">
                    <div
                        v-for="log in logs"
                        :key="log.id"
                        class="p-5 flex items-center justify-between hover:bg-slate-50/50 transition"
                    >
                        <div class="flex items-center gap-4 text-left">
                            <div
                                class="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center font-black text-sky-600 text-xs"
                            >
                                {{
                                    log.relawan?.nama_relawan
                                        ?.substring(0, 2)
                                        .toUpperCase() || "??"
                                }}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-700">
                                    {{
                                        log.relawan?.nama_relawan ||
                                        "UID: " + log.rfid_uid
                                    }}
                                </p>
                                <p
                                    class="text-[10px] font-medium text-slate-400"
                                >
                                    {{ formatWaktu(log.waktu_tap) }}
                                </p>
                            </div>
                        </div>

                        <div class="text-right">
                            <span
                                class="px-3 py-1 rounded-lg text-[10px] font-black uppercase border"
                                :class="
                                    log.status_absensi === 'Masuk'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                "
                            >
                                {{ log.status_absensi }}
                            </span>
                        </div>
                    </div>

                    <div
                        v-if="logs.length === 0"
                        class="py-20 text-center text-slate-400 italic text-sm font-medium"
                    >
                        Belum ada aktivitas presensi hari ini.
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabaseClient";
import { Rss } from "lucide-vue-next";
import Swal from "sweetalert2";

const inputUid = ref("");
const logs = ref([]);

// Format Waktu agar lebih enak dibaca
const formatWaktu = dateStr => {
    const tgl = new Date(dateStr);
    return (
        tgl.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }) +
        " - " +
        tgl.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    );
};

// Ambil data log terbaru
async function fetchLogs() {
    const { data, error } = await supabase
        .from("absensi_relawan")
        .select(
            `
      *,
      relawan:rfid_uid (
        nama_relawan
      )
    `
        )
        .order("waktu_tap", { ascending: false })
        .limit(10);

    if (data) {
        logs.value = data;
        console.log("Log Terbaru:", data); // Cek di console log browser (F12)
    }
}

async function simulasiTap(status) {
    try {
        const uidBaku = inputUid.value.toUpperCase().trim();
        if (!uidBaku) return;

        // --- 1. CEK APAKAH ADA JADWAL (Mencegah Orang Iseng) ---
        const hariIni = new Date().toISOString().split("T")[0];
        const { data: jadwal, error: errJadwal } = await supabase
            .from("jadwal_kerja")
            .select("*, relawan(nama_relawan)")
            .eq("rfid_uid", uidBaku)
            .eq("tanggal", hariIni)
            .single();

        if (!jadwal) {
            Swal.fire({
                icon: "error",
                title: "Akses Ditolak",
                text: "Anda tidak memiliki jadwal kerja hari ini. Silakan hubungi pihak dapur jika ini penugasan mendadak."
            });
            return;
        }

        // --- 2. CEK ANTI-SPAM (Mencegah Tap Terus-menerus) ---
        // Cari tap terakhir dari UID ini dalam 1 menit terakhir
        const satuMenitLalu = new Date(Date.now() - 60000).toISOString();

        const { data: tapTerakhir } = await supabase
            .from("absensi_relawan")
            .select("waktu_tap")
            .eq("rfid_uid", uidBaku)
            .eq("status_absensi", status)
            .gte("waktu_tap", satuMenitLalu)
            .limit(1);

        if (tapTerakhir && tapTerakhir.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Sabar...",
                text: `Anda baru saja melakukan tap ${status}. Tunggu 1 menit untuk tap lagi.`,
                timer: 2000,
                showConfirmButton: false
            });
            inputUid.value = "";
            return;
        }

        // --- 3. JIKA LOLOS SEMUA CEK, BARU INSERT ---
        const { error: errInsert } = await supabase
            .from("absensi_relawan")
            .insert({
                rfid_uid: uidBaku,
                status_absensi: status,
                waktu_tap: new Date().toISOString(),
                jadwal_id: jadwal.id // Mengaitkan absensi dengan jadwalnya
            });

        if (errInsert) throw errInsert;

        // Berhasil
        inputUid.value = "";
        fetchLogs(); // Refresh list real-time

        Swal.fire({
            icon: "success",
            title: `Halo, ${jadwal.relawan.nama_relawan}!`,
            text: `Presensi ${status} berhasil dicatat.`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan sistem.", "error");
    }
}

onMounted(() => {
    fetchLogs();

    // OPTIONAL: Aktifkan Real-time dari Supabase
    supabase
        .channel("absensi_realtime")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "absensi_relawan" },
            () => {
                fetchLogs();
            }
        )
        .subscribe();
});
</script>
