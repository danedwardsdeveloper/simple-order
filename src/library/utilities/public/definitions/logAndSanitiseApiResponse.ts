import { isDevelopment } from '@/library/environment/publicVariables'
import logger from '@/library/logger';
import type { LogLevel } from '@/types'

export function logAndSanitiseApiResponse({
	routeDetail,
	message,
	level = 'level1error',
	error,
}: { routeDetail: string; message: string; level?: LogLevel; error?: unknown }): string | undefined {
	switch (level) {
		case 'level0none':
			break
		case 'level1error':
			logger.error(routeDetail, message, error)
			break
		case 'level2warn':
			logger.warn(routeDetail, message)
			break
		case 'level3info':
			logger.info(routeDetail, message)
			break
		default:
			logger.debug(routeDetail, message)
			break
	}

	return isDevelopment ? message : undefined
}

export function logAndSanitiseApiError({ routeDetail, error }: { routeDetail: string; error: unknown }): unknown {
	logger.error(routeDetail, error)
	const developmentError = error instanceof Error ? error.message : 'unknown error'
	return isDevelopment ? developmentError : undefined
}
