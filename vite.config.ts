import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the same build works at the root origin
  // (localhost:5173) and under a subpath (GitHub Pages /quill/).
  base: './',
})
