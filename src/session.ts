import parse from 'set-cookie-parser'

import { BASE_URL, FLEXY_PASSWORD, FLEXY_USERNAME } from './config'
import { logger } from './logger'

class Session {
  private _sessionId: string | null = null

  public async create() {
    logger.info('Criando sessão na plataforma')

    const response = await fetch(BASE_URL)

    const sessionId = parse(response.headers.getSetCookie(), { map: true }).FLEXYSESSID.value
    if (!sessionId) throw new Error('Não foi possível criar uma sessão')

    this._sessionId = sessionId
  }

  public async signIn() {
    logger.info('Autenticando na plataforma')

    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      body: `_username=${encodeURI(FLEXY_USERNAME)}&_password=${FLEXY_PASSWORD}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        cookie: `FLEXYSESSID=${this._sessionId}`,
      },
    })

    const text = await response.text()
    if (text.includes('Dados de acesso inválidos')) throw new Error('Dados de acesso inválidos')
  }

  public get id() {
    return this._sessionId
  }
}

export const session = new Session()
