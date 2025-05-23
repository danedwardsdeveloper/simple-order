import { durationSettings } from '@/library/constants'
import type { DayNumber, Month, Year } from '@/types'

export function createDate(day: DayNumber, month: Month, year: Year): Date {
	return new Date(Date.UTC(year, month, day))
}

export function invitationExpiryDate() {
	return new Date(Date.now() + durationSettings.acceptInvitationExpiry)
}
