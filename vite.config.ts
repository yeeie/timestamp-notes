import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative base so the built site works when opened from file:// or deployed under
  // a sub-path such as GitHub Pages `docs/` without needing absolute `/` paths.
  base: '/timestamp-notes/',
  server: { port: 5173 }
})
