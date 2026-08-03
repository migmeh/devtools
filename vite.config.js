import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escucha en todas las IPs locales
    port: 5173,
    watch: {
      usePolling: true, // Necesario si usas Docker en Windows/Mac
    },
    hmr: {
      host: 'localhost', // Fuerza al cliente a reconectarse a localhost (útil con Docker+puertos mapeados)
      clientPort: 5173, // Asegura que el navegador sepa a qué puerto reconectarse
    },
  },
})