import colors, { StyleFunction } from 'ansi-colors'
import ProgressBar from 'progress'

type Level = 'error' | 'info' | 'success' | 'reset'

const levels: { [K in Level]: StyleFunction } = {
  error: colors.red,
  info: colors.blue,
  success: colors.green,
  reset: colors.reset,
}

export const logger = {
  log: (level: Level, message: string): void => {
    console.log(`${levels[level](`[${level.toUpperCase()}]`)} ${message}`)
  },

  error: (message: string): void => {
    logger.log('error', message)
  },

  info: (message: string): void => {
    logger.log('info', message)
  },

  success: (message: string): void => {
    logger.log('success', message)
  },
}

export function createProgressBar(title: string, total: number) {
  return new ProgressBar(`  ${title} [:bar] :percent :current/:total`, { total })
}
