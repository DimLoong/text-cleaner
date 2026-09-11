import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // Pages does not need browser sourcemaps for this static app. Disabling
    // sourcemap and gzip reporting avoids extra memory/CPU work in CI after
    // Rollup has already emitted the production assets.
    sourcemap: false,
    reportCompressedSize: false,
  },
});
