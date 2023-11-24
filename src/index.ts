#!/usr/bin/env node
import 'dotenv/config'

import { PromisePool } from '@supercharge/promise-pool'
import { mkdir } from 'fs/promises'

import { CONCURRENCY, TEMPLATES_PATH } from './config'
import { start } from './hot-reload'
import { createProgressBar } from './logger'
import { createWatcher, selectTemplates, shouldDownload } from './utils'

async function main() {
  await mkdir(TEMPLATES_PATH, { recursive: true })

  if (await shouldDownload()) {
    const templates = await selectTemplates()

    const bar = createProgressBar('Baixando templates', templates.length)
    await PromisePool.for(templates)
      .withConcurrency(CONCURRENCY)
      .onTaskStarted(() => bar.tick())
      .process((template) => template.download())
  }

  const hrServer = await start()

  await createWatcher(async (template) => {
    await template.upload()
    await hrServer.emit('reload')
  })
}

main()
