import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const certDir = path.join(process.env.HOME || '', '.vite-plugin-mkcert')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    https: fs.existsSync(path.join(certDir, 'cert.pem')) ? {
      key: fs.readFileSync(path.join(certDir, 'dev.pem')),
      cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
    } : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
