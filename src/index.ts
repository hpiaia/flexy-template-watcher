#!/usr/bin/env node
import { checkbox, confirm } from '@inquirer/prompts'
import { PromisePool } from '@supercharge/promise-pool'
import 'dotenv/config'
import { mkdir } from 'fs/promises'

import { ALL_TEMPLATES, CONCURRENCY, TEMPLATES_PATH } from './config'
import { start } from './hot-reload'
import { createProgressBar } from './logger'
import { createWatcher } from './utils'

async function main() {
  try {
    await mkdir(TEMPLATES_PATH, { recursive: true })

    const download = await confirm({
      message: 'Deseja fazer download de algum template?',
      default: false,
    })

    if (download) {
      const templates = (
        await checkbox({
          message: 'Selecione os templates para baixar',
          choices: ALL_TEMPLATES,
        })
      ).map((value) => ALL_TEMPLATES.find((template) => template.value === value)!)

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
  } catch (e) {
    //
  }
}

main()
