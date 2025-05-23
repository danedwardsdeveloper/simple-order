'use client'
import type { SettingsDeliveryDaysPATCHbody, SettingsDeliveryDaysPATCHresponse } from '@/app/api/settings/delivery-days/patch'
import type { SettingsGETresponse } from '@/app/api/settings/get'
import type { SettingsHolidaysPOSTbody, SettingsHolidaysPOSTresponse } from '@/app/api/settings/holidays/post'
import type { SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/patch'
import { useNotifications } from '@/components/providers/notifications'
import { useUser } from '@/components/providers/user'
import { userNotifications } from '@/library/constants'
import { apiRequest, developmentDelay } from '@/library/utilities/public'
import type { BrowserSafeCompositeUser, Holiday, SettingsContextType, WeekDayIndex } from '@/types'
import { produce } from 'immer'
import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLoading } from './loading'

const MerchantSettingsContext = createContext<SettingsContextType | null>(null)

const {
	settingsUpdated: { cutOffMessage, minimumSpendMessage, holidayAddedMessage, leadTimeDaysMessage, deliveryDaysMessage },
} = userNotifications

export function MerchantSettingsProvider({ children }: { children: ReactNode }) {
	const { setDataLoading } = useLoading()
	const { user, setUser } = useUser()
	const { successNotification, errorNotification, serverErrorNotification } = useNotifications()

	// Settings that aren't already in the user object
	const [retrievedSettings, setRetrievedSettings] = useState<{
		holidays: Holiday[] | null
		acceptedWeekDayIndices: WeekDayIndex[] | null
	}>({
		holidays: null,
		acceptedWeekDayIndices: null,
	})

	const settingsFetched = useRef(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		// Global loading state
		async function fetchSettings() {
			try {
				setDataLoading(true)
				const { ok, holidays, acceptedWeekDayIndices, userMessage } = await apiRequest<SettingsGETresponse>({
					basePath: '/settings',
				})

				if (holidays) {
					setRetrievedSettings((prev) => ({ ...prev, holidays }))
				}

				if (acceptedWeekDayIndices) {
					setRetrievedSettings((prev) => ({ ...prev, acceptedWeekDayIndices }))
				}

				if (!ok && userMessage) {
					errorNotification(userMessage)
					return
				}
			} catch {
				serverErrorNotification()
			} finally {
				setDataLoading(false)
			}
		}

		if (!settingsFetched.current && user && user.roles !== 'customer') {
			fetchSettings()
			settingsFetched.current = true
		}
	}, [user])

	async function updateSetting(body: SettingsPATCHbody, onSuccess: (user: BrowserSafeCompositeUser) => void): Promise<boolean> {
		try {
			const { ok, userMessage } = await apiRequest<SettingsPATCHresponse, SettingsPATCHbody>({
				basePath: '/settings',
				method: 'PATCH',
				body,
			})

			if (ok) {
				setUser(
					produce((prevUser) => {
						if (!prevUser) return prevUser
						onSuccess(prevUser)
					}),
				)

				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function saveCutOffTime(value: Date): Promise<boolean> {
		try {
			await developmentDelay()

			const success = await updateSetting({ cutOffTime: value }, (user) => {
				user.cutOffTime = value
			})

			if (success) {
				successNotification(cutOffMessage)
			}

			return success
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function saveLeadTime(value: number): Promise<boolean> {
		try {
			await developmentDelay()

			const success = await updateSetting({ leadTimeDays: value }, (user) => {
				user.leadTimeDays = value
			})

			if (success) {
				successNotification(leadTimeDaysMessage)
			}

			return success
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function saveMinimumSpendPence(value: number): Promise<boolean> {
		try {
			await developmentDelay()

			const success = await updateSetting({ minimumSpendPence: value }, (user) => {
				user.minimumSpendPence = value
			})

			if (success) {
				successNotification(minimumSpendMessage)
			}

			return success
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function addHoliday(startDate: Date, endDate?: Date): Promise<boolean> {
		const holidaysToAdd = [{ startDate, endDate: endDate ? endDate : startDate }]

		try {
			await developmentDelay()

			const { ok, userMessage } = await apiRequest<SettingsHolidaysPOSTresponse, SettingsHolidaysPOSTbody>({
				basePath: '/settings/holidays',
				method: 'POST',
				body: { holidaysToAdd },
			})

			if (ok) {
				setRetrievedSettings((prev) => ({
					...prev,
					holidays: [...(prev.holidays || []), ...holidaysToAdd],
				}))
				successNotification(holidayAddedMessage)
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		}
	}

	async function saveDeliveryDays(dayIndexes: number[]): Promise<boolean> {
		try {
			await developmentDelay()

			const { ok, userMessage } = await apiRequest<SettingsDeliveryDaysPATCHresponse, SettingsDeliveryDaysPATCHbody>({
				basePath: '/settings/delivery-days',
				method: 'PATCH',
				body: { updatedWeekDayIndexes: dayIndexes },
			})

			if (ok) {
				setRetrievedSettings((prev) => ({ ...prev, acceptedWeekDayIndices: dayIndexes as WeekDayIndex[] }))
				successNotification(deliveryDaysMessage)
				return true
			}

			if (userMessage) errorNotification(userMessage)
			return false
		} catch {
			serverErrorNotification()
			return false
		}
	}

	const value = {
		holidays: retrievedSettings.holidays,
		acceptedWeekDayIndices: retrievedSettings.acceptedWeekDayIndices,
		saveCutOffTime,
		saveLeadTime,
		saveMinimumSpendPence,
		addHoliday,
		saveDeliveryDays,
	}

	return <MerchantSettingsContext.Provider value={value}>{children}</MerchantSettingsContext.Provider>
}

export function useMerchantSettings() {
	const context = useContext(MerchantSettingsContext)

	if (!context) {
		throw new Error('useMerchantSettings must be used within a MerchantSettingsProvider')
	}

	return context
}
