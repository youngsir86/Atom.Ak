import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
// Vercel 不需要 base 配置
// GitHub Pages 部署时通过 --base 参数覆盖
export default defineConfig({
  plugins: [react()],
});

