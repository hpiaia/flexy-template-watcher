import { connect } from 'ngrok'
import { Server } from 'socket.io'

import { HOT_RELOAD_PORT } from './config'
import { logger } from './logger'

export async function start() {
  const url = await connect({ addr: HOT_RELOAD_PORT })

  logger.info(`Hot reload server listening on ${url}`)

  return new Server().listen(HOT_RELOAD_PORT, {
    cors: { origin: '*' },
  })
}
