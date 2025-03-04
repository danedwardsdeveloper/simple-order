'use client'
import Spinner from '@/components/Spinner'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import { useUser } from '@/providers/user'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import type {
	StripeCreateCheckoutSessionPOSTbody,
	StripeCreateCheckoutSessionPOSTresponse,
} from '../api/payments/create-checkout-session/route'

export default function CheckoutPage() {
	const searchParams = useSearchParams()
	const status = searchParams.get('success')
	const { user } = useUser()
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	if (status === 'true') return <h1>Successfully subscribed</h1>
	if (status === 'false') return <h1>Subscription cancelled</h1>

	if (!user) return <UnauthorisedLinks />

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()

		if (!user) return null

		setIsLoading(true)
		try {
			const { redirectUrl, message }: StripeCreateCheckoutSessionPOSTresponse = await (
				await fetch(apiPaths.payments.createCheckoutSession, {
					method: 'POST',
					body: JSON.stringify({
						email: user.email,
					} satisfies StripeCreateCheckoutSessionPOSTbody),
				})
			).json()

			if (message === 'success' && redirectUrl) return router.push(redirectUrl)

			logger.error('Client-side app/checkout/CheckoutForm.tsx error: ', message)
		} catch (error) {
			logger.error('app/checkout/CheckoutForm.tsx error: ', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<button type="submit" className="button-primary max-w-sm w-full h-10 flex justify-center items-center" disabled={isLoading}>
				{isLoading ? <Spinner classes="text-white" /> : 'Checkout'}
			</button>
		</form>
	)
}
