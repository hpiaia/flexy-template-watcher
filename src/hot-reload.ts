import { connect } from 'ngrok'
import { Server } from 'socket.io'

import { logger } from './logger'

const PORT = 3000

export async function start() {
  const url = await connect({ addr: PORT, region: 'sa' })

  logger.info(`Hot reload server listening on ${url}`)

  return new Server().listen(PORT, {
    cors: { origin: '*' },
  })
}
