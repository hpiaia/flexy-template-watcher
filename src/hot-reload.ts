import { create } from 'browser-sync'
import { connect } from 'ngrok'

import { TEMPLATES_PATH } from './config'
import { logger } from './logger'

export async function start() {
  const url = await connect({
    region: 'sa',
    addr: 3000,
  })

  const browserSync = create()

  browserSync.init({
    server: true,
    serveStatic: [TEMPLATES_PATH],
    open: false,
    socket: {
      domain: url,
    },
    logLevel: 'silent',
    callbacks: {
      ready: async () => {
        logger.info(`Hot reload iniciado, adicione o script -> [${url}/browser-sync/browser-sync-client.js]`)
      },
    },
  })

  return browserSync
}
