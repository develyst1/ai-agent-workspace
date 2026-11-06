// Throwaway (TASK-029 phase A). Run from the app checkout so its node_modules are found:
//   cd <corner-chat-app> && npx vite --config <this file> --port 5199 --strictPort
// Imports of `@app/...` go to the app's src; the few libraries this harness imports itself are pinned to the app's copies.
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const APP = process.env.APP_DIR ?? 'H:/corner-chat/corner-chat-app'

export default {
  root: here,
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: [
      { find: '@app', replacement: `${APP}/src` },
      { find: /^react-dom(\/.*)?$/, replacement: `${APP}/node_modules/react-dom$1` },
      { find: /^react(\/.*)?$/, replacement: `${APP}/node_modules/react$1` },
      { find: /^antd-mobile(\/.*)?$/, replacement: `${APP}/node_modules/antd-mobile$1` },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: { fs: { strict: false } },
}
