import { load } from 'cheerio'
import { readFile, writeFile } from 'fs/promises'
import { decode } from 'html-entities'
import { resolve } from 'path'

import { BASE_URL, TEMPLATES_PATH } from './config'
import { request } from './utils'

export class Template {
  constructor(
    public name: string,
    public value: string,
  ) {}

  get remotePath() {
    return `${BASE_URL}/${this.value}`
  }

  get remoteContent() {
    return request(this.remotePath, 'get')
      .then((html) => load(html)('textarea#template_content').html())
      .then(decode)
  }

  get localPath() {
    return resolve(TEMPLATES_PATH, this.value)
  }

  get localContent() {
    return readFile(this.localPath, 'utf-8')
  }

  async download() {
    writeFile(this.localPath, await this.remoteContent)
  }

  async upload() {
    await request(this.remotePath, 'post', {
      template: {
        name: this.name,
        content: await this.localContent,
      },
    })
  }
}
