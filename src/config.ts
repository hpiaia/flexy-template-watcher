import invariant from 'tiny-invariant'

import templates from './data/templates.json'
import { Template } from './template'

invariant(process.env.BASE_URL, 'BASE_URL is not defined')
invariant(process.env.SESSION_TOKEN, 'SESSION_TOKEN is not defined')
invariant(process.env.TEMPLATES_PATH, 'TEMPLATES_PATH is not defined')

export const BASE_URL = process.env.BASE_URL
export const SESSION_TOKEN = process.env.SESSION_TOKEN
export const TEMPLATES_PATH = process.env.TEMPLATES_PATH
export const CONCURRENCY = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 3

export const ALL_TEMPLATES: Template[] = templates.map((template) => new Template(template.name, template.value))
