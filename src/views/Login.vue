<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100 text-center">
      
      <div class="flex justify-center mb-6">
        <img :src="logoUrl" alt="Logo SPPG" class="h-24 w-24 object-contain" />
      </div>
      <h2 class="text-2xl font-black text-slate-800 mb-1">SPPG CIGEDUG 2</h2>
      <br />
      
      <div class="text-left">
        <input v-model="email" type="email" placeholder="Email" class="w-full p-3 mb-4 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition">
        <input v-model="password" type="password" placeholder="Password" class="w-full p-3 mb-6 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition">
      </div>
      
      <button 
        @click="handleLogin" 
        :disabled="loading"
        class="w-full bg-sky-600 text-white p-3 rounded-xl font-bold hover:bg-sky-700 transition active:scale-95"
      >
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../lib/supabaseClient';
import logoUrl from '../assets/logo.png';
const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push('/dashboard');
  } catch (err) {
    alert("Login Gagal: " + err.message);
  } finally {
    loading.value = false;
  }
}
</script>
