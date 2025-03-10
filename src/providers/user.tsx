'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import type { InvitationsGETresponse } from '@/app/api/invitations/route'
import type { RelationshipsGETresponse } from '@/app/api/relationships/route'
import { apiPaths, temporaryVat } from '@/library/constants'
import logger from '@/library/logger'
import type {
	BrowserSafeCompositeUser,
	BrowserSafeCustomerProfile,
	BrowserSafeInvitationReceived,
	BrowserSafeInvitationSent,
	BrowserSafeMerchantProduct,
	BrowserSafeMerchantProfile,
} from '@/types'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNotifications } from './notifications'
import { useUi } from './ui'

interface UserContextType {
	user: BrowserSafeCompositeUser | null
	setUser: Dispatch<SetStateAction<BrowserSafeCompositeUser | null>>

	inventory: BrowserSafeMerchantProduct[] | null
	setInventory: Dispatch<SetStateAction<BrowserSafeMerchantProduct[] | null>>
	hasAttemptedInventoryFetch: boolean
	setHasAttemptedInventoryFetch: Dispatch<SetStateAction<boolean>>

	confirmedMerchants: BrowserSafeMerchantProfile[] | null
	setConfirmedMerchants: Dispatch<SetStateAction<BrowserSafeMerchantProfile[] | null>>
	confirmedCustomers: BrowserSafeCustomerProfile[] | null
	setConfirmedCustomers: Dispatch<SetStateAction<BrowserSafeCustomerProfile[] | null>>

	invitationsReceived: BrowserSafeInvitationReceived[] | null
	setInvitationsReceived: Dispatch<SetStateAction<BrowserSafeInvitationReceived[] | null>>

	invitationsSent: BrowserSafeInvitationSent[] | null
	setInvitationsSent: Dispatch<SetStateAction<BrowserSafeInvitationSent[] | null>>

	vat: number
	isLoading: boolean
}

const UserContext = createContext<UserContextType>({} as UserContextType)

// ToDo: Change default states back to being null instead of empty arrays as it's confusing!

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const { setMerchantMode } = useUi()
	const [user, setUser] = useState<BrowserSafeCompositeUser | null>(null)
	const [inventory, setInventory] = useState<BrowserSafeMerchantProduct[] | null>(null)
	const [hasAttemptedInventoryFetch, setHasAttemptedInventoryFetch] = useState(false)
	const { createNotification } = useNotifications()
	const hasCheckedToken = useRef(false)

	const [confirmedMerchants, setConfirmedMerchants] = useState<BrowserSafeMerchantProfile[] | null>(null)
	const [confirmedCustomers, setConfirmedCustomers] = useState<BrowserSafeCustomerProfile[] | null>(null)

	const [invitationsReceived, setInvitationsReceived] = useState<BrowserSafeInvitationReceived[] | null>(null)
	const [invitationsSent, setInvitationsSent] = useState<BrowserSafeInvitationSent[] | null>(null)

	const [isLoading, setIsLoading] = useState(true)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Run on mount only>
	useEffect(() => {
		async function getUser() {
			setIsLoading(true)
			try {
				const response = await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })
				const { user, message }: VerifyTokenGETresponse = await response.json()

				if (user) {
					setUser(user)

					// Enhancement ToDO: change this so that it remembers the last used state/recorded preference
					if (user.roles === 'both' || user.roles === 'merchant') {
						setMerchantMode(true)
					} else {
						setMerchantMode(false)
					}

					await getRelationships()
					await getInvitations()
				} else if (message === 'token expired' || message === 'token invalid' || message === 'user not found') {
					// Only show notification if they were previously logged in
					createNotification({
						level: 'warning',
						title: 'Signed out',
						message: 'You have been signed out.',
					})
				}
			} catch (error) {
				logger.error(`User provider ${apiPaths.authentication.verifyToken}`, error)
			} finally {
				setIsLoading(false)
			}
		}

		// Optimisation ToDo: send concurrent requests with Promise.all
		async function getRelationships() {
			try {
				const { customers, merchants }: RelationshipsGETresponse = await (
					await fetch(apiPaths.relationships, { credentials: 'include' })
				).json()
				setConfirmedMerchants(merchants || null)
				setConfirmedCustomers(customers || null)
			} catch (error) {
				logger.error(`User provider ${apiPaths.relationships}`, error)
			}
		}

		async function getInvitations() {
			const invitationsURL = apiPaths.invitations.base
			try {
				const invitationsResponse = await fetch(invitationsURL, {
					credentials: 'include',
				})

				const { invitationsSent, invitationsReceived, message }: InvitationsGETresponse = await invitationsResponse.json()

				setInvitationsSent(invitationsSent || null)
				setInvitationsReceived(invitationsReceived || null)
				if (!invitationsResponse.ok) {
					logger.warn(`User provider ${invitationsURL}: request unsuccessful`, message)
				}
			} catch (error) {
				logger.error(`User provider ${invitationsURL}: `, error)
			}
		}

		if (!user && !hasCheckedToken.current) {
			getUser()
			hasCheckedToken.current = true
		}
	}, [])

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,

				inventory,
				setInventory,
				hasAttemptedInventoryFetch,
				setHasAttemptedInventoryFetch,

				confirmedMerchants,
				setConfirmedMerchants,

				confirmedCustomers,
				setConfirmedCustomers,

				invitationsReceived,
				setInvitationsReceived,

				invitationsSent,
				setInvitationsSent,

				isLoading,
				vat: temporaryVat,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => {
	const context = useContext(UserContext)
	if (context === undefined) throw new Error('useUser must be used within the UserProvider')
	return context
}
