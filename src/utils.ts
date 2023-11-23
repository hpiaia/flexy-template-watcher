import { load } from 'cheerio'
import { watch } from 'chokidar'
import { decode } from 'html-entities'
import { serialize } from 'object-to-formdata'

import { ALL_TEMPLATES, SESSION_TOKEN, TEMPLATES_PATH } from './config'
import { logger } from './logger'
import { Template } from './template'

export async function request(
  url: string,
  method: 'get' | 'post',
  body?: { template: { name: string; content: string } },
) {
  return fetch(url, {
    method,
    body: method === 'post' && body ? serialize(body) : undefined,
    headers: { cookie: `FLEXYSESSID=${SESSION_TOKEN}` },
  }).then((res) => res.text())
}

export function scrapeTemplateContent(html: string) {
  const templateContent = load(html)('textarea#template_content').html()
  return decode(templateContent)
}

export function createWatcher(onChange: (template: Template) => void) {
  return watch(TEMPLATES_PATH)
    .on('ready', () => {
      logger.info('Observando alterações nos templates, pressione Ctrl+C para sair')
    })
    .on('change', async (path) => {
      const template = ALL_TEMPLATES.find((template) => template.localPath === path)!
      logger.info(`Template [${template.value}] alterado`)
      onChange(template)
    })
}
