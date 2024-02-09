import { checkbox, confirm, select } from '@inquirer/prompts'
import { watch } from 'chokidar'
import { readdir } from 'fs/promises'
import { serialize } from 'object-to-formdata'

import { ALL_TEMPLATES, TEMPLATES_PATH } from './config'
import { logger } from './logger'
import { session } from './session'
import { Template } from './template'

export async function request(
  url: string,
  method: 'get' | 'post',
  body?: { template: { name: string; content: string } },
) {
  return fetch(url, {
    method,
    body: method === 'post' && body ? serialize(body) : undefined,
    headers: { cookie: `FLEXYSESSID=${session.id}` },
  }).then((res) => res.text())
}

export function findTemplate(value: string) {
  return ALL_TEMPLATES.find((template) => template.localPath === value)!
}

export function createWatcher(onChange: (template: Template) => void) {
  return watch(TEMPLATES_PATH, {
    ignored: /(^|[\/\\])\../,
  })
    .on('ready', () => logger.info('Observando alterações nos templates, pressione Ctrl+C para sair'))
    .on('change', async (path) => onChange(Template.fromLocalPath(path)))
}

export function shouldDownload() {
  return confirm({ message: 'Deseja fazer download de algum template?', default: false })
}

export async function selectTemplates() {
  const type = await select({
    message: 'Quais templates você deseja baixar?',
    choices: [
      { name: 'Todos', value: 'all' },
      { name: 'Alguns', value: 'some' },
      { name: 'Somente os que eu não tenho', value: 'only-new' },
    ],
  })

  if (type === 'some') {
    return (
      await checkbox({
        message: 'Selecione os templates para baixar',
        choices: ALL_TEMPLATES,
      })
    ).map((value) => ALL_TEMPLATES.find((template) => template.value === value)!)
  }

  if (type === 'only-new') {
    const templates = await readdir(TEMPLATES_PATH)
    return ALL_TEMPLATES.filter((template) => !templates.includes(template.value))
  }

  return ALL_TEMPLATES
}
