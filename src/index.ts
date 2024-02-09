#!/usr/bin/env node
import 'dotenv/config'

import { PromisePool } from '@supercharge/promise-pool'
import { mkdir } from 'fs/promises'

import { CONCURRENCY, TEMPLATES_PATH } from './config'
import { start } from './hot-reload'
import { createProgressBar, logger } from './logger'
import { session } from './session'
import { createWatcher, selectTemplates, shouldDownload } from './utils'

async function main() {
  await mkdir(TEMPLATES_PATH, { recursive: true })

  await session.create()
  await session.signIn()

  if (await shouldDownload()) {
    const templates = await selectTemplates()

    const bar = createProgressBar('Baixando templates', templates.length)
    await PromisePool.for(templates)
      .withConcurrency(CONCURRENCY)
      .onTaskStarted(() => bar.tick())
      .process((template) => template.download())
  }

  const browserSync = await start()

  await createWatcher(async (template) => {
    await template.upload()
    logger.success(`Template ${template.name} atualizado`)
    browserSync.reload()
  })
}

main()
