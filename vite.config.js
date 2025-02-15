import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        import: resolve(__dirname, 'src/import.ts'),
        export: resolve(__dirname, 'src/export.ts'),
        helper: resolve(__dirname, 'src/helper.ts')
      },
      formats: ['es', 'cjs']
    },
    minify: 'esbuild',
    rollupOptions: {
      external: [
        'firebase-admin',
        'google-gax',
        'uuid',
        'events',
        'fs',
        'path',
        /^firebase-admin\/.*/,
        /^google-gax\/.*/,
        /^node:.*/
      ],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
          interop: 'auto'
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          exports: 'named',
          interop: 'auto'
        }
      ]
    }
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.spec.ts'],
      outputDir: 'dist'
    })
  ]
}); 