import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Ini harus mengarah ke file index.js di folder router kamu

const app = createApp(App)

app.use(router) // Router dipasang di sini
app.mount('#app')
