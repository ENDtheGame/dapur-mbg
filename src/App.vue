<template>
  <router-view />
  <AsistenAI v-if="tampilkanAsisten" />
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "./lib/supabaseClient";
import AsistenAI from "./components/AsistenAI.vue"; // Pastikan path file-nya benar

const router = useRouter();
const hasSession = ref(false);

const tampilkanAsisten = computed(() => {
  // Cek apakah route sudah ada, lalu cek nama atau meta-nya
  return router.name && router.name !== "login" && !router.meta?.hideAssistant;
});

onMounted(async () => {
  // Cek session awal saat aplikasi dimuat
  const { data } = await supabase.auth.getSession();
  hasSession.value = !!data.session;

  // Pantau perubahan status login
  supabase.auth.onAuthStateChange((event, session) => {
    hasSession.value = !!session;

    if (event === "SIGNED_OUT") {
      router.push("/login");
    }
  });
});
</script>
