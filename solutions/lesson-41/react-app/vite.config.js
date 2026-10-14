import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths in the built files, so the app works from any folder,
  // like https://YOUR-USERNAME.github.io/chat-clone/react-app/
  base: './',
})
