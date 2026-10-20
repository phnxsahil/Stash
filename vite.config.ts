import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'node:fs/promises';

const pwaServiceWorkerPlugin = {
  name: 'stash-pwa-service-worker',
  async closeBundle() {
    const outDir = path.resolve(__dirname, 'dist');
    const templatePath = path.resolve(__dirname, 'public/sw.js');
    const workerTemplate = await fs.readFile(templatePath, 'utf8');
    const files: string[] = [];

    const collectFiles = async (directory: string, prefix = '') => {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await collectFiles(absolutePath, relativePath);
        } else if (relativePath !== 'sw.js' && !relativePath.endsWith('.map')) {
          files.push(`/${relativePath.replaceAll('\\', '/')}`);
        }
      }
    };

    await collectFiles(outDir);
    const precache = Array.from(new Set(['/','/index.html', ...files])).sort();
    const buildId = process.env.VITE_BUILD_ID || `${Date.now()}`;
    const worker = workerTemplate
      .replace('__BUILD_ID__', buildId)
      .replace('__PRECACHE_MANIFEST_JSON__', JSON.stringify(precache));

    await fs.writeFile(path.join(outDir, 'sw.js'), worker, 'utf8');
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), pwaServiceWorkerPlugin],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'charts': ['recharts'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
  },
});