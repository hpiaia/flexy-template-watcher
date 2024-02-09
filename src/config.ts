import path from 'path'
import invariant from 'tiny-invariant'

import templates from './data/templates.json'
import { Template } from './template'

invariant(process.env.BASE_URL, 'BASE_URL is not defined')
invariant(process.env.FLEXY_USERNAME, 'FLEXY_USERNAME is not defined')
invariant(process.env.FLEXY_PASSWORD, 'FLEXY_PASSWORD is not defined')

export const BASE_URL = process.env.BASE_URL

export const FLEXY_USERNAME = process.env.FLEXY_USERNAME
export const FLEXY_PASSWORD = process.env.FLEXY_PASSWORD

export const TEMPLATES_PATH = path.resolve(__dirname, '..', 'templates')
export const CONCURRENCY = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 3
export const HOT_RELOAD_PORT = process.env.HOT_RELOAD_PORT ? parseInt(process.env.HOT_RELOAD_PORT) : 8182

export const ALL_TEMPLATES: Template[] = templates.map((template) => new Template(template.name, template.value))

export let SESSION_ID: string | null = null
