import type { LogLevel } from '@/types'
import { logLevels } from './constants'
import { browserLogLevel, serverLogLevel } from './environment/publicVariables'

const isServer = typeof window === 'undefined'

const consoleColours = {
	debug: 'color: #c084fc', // Purple
	info: 'color: #3498DB', // Blue
	warn: 'color: #FFA500', // Orange
	error: 'color: #FF3838', // Red
}

const serverColors = {
	reset: '\x1b[0m',
	debug: '\x1b[35m', // Magenta
	info: '\x1b[34m', // Blue
	warn: '\x1b[33m', // Yellow
	error: '\x1b[31m', // Red
} as const

const shouldLog = (messageLevel: LogLevel) => {
	const currentLevel = isServer ? serverLogLevel : browserLogLevel
	return logLevels[messageLevel] <= logLevels[currentLevel]
}

function stringifyUnknownData(data: unknown): string {
	if (typeof data === 'string') return data

	if (data instanceof Error) {
		const errorProps: Record<string, unknown> = {
			name: data.name,
			message: data.message,
		}

		return JSON.stringify(errorProps, null, 2)
	}

	try {
		return JSON.stringify(
			data,
			(_key, value) => {
				if (value instanceof Map || value instanceof Set) {
					const isMap = value instanceof Map
					return {
						__type: isMap ? 'Map' : 'Set',
						size: value.size,
						...(isMap ? { entries: Array.from(value.entries()) } : { values: Array.from(value.values()) }),
					}
				}
				return value
			},
			2,
		)
	} catch {
		return '[Unserializable data]'
	}
}

const stringifyArguments = (...args: unknown[]): string[] => args.map((arg) => (typeof arg === 'string' ? arg : stringifyUnknownData(arg)))

const createServerLogger = (type: 'debug' | 'info' | 'warn' | 'error', label: string) => {
	return (...args: unknown[]) => {
		const message = stringifyArguments(...args).join(' ')
		// biome-ignore lint/suspicious/noConsole:
		console[type](`${serverColors[type]}${label} ${message}${serverColors.reset}`)
	}
}

const createBrowserLogger =
	(type: keyof typeof consoleColours, label: string) =>
	(...args: unknown[]): void => {
		const style = consoleColours[type]
		const message = stringifyArguments(...args).join(' ')
		// biome-ignore lint/suspicious/noConsole:
		console[type](`%c${label} ${message}`, style)
	}

const createLogger = (type: 'debug' | 'info' | 'warn' | 'error', label: string) =>
	isServer ? createServerLogger(type, label) : createBrowserLogger(type, label)

const logger = {
	debug: shouldLog('level4debug') ? createLogger('debug', '[DEBUG]') : () => {},
	info: shouldLog('level3info') ? createLogger('info', '[INFO]') : () => {},
	warn: shouldLog('level2warn') ? createLogger('warn', '[WARN]') : () => {},
	error: shouldLog('level1error') ? createLogger('error', '[ERROR]') : () => {},
}

export default logger
