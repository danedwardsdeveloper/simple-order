import { apiPaths, basicMessages, httpStatus } from '@/library/constants'
import { stripeWebhookSecret } from '@/library/environment/serverVariables'
import logger from '@/library/logger'
import stripeClient from '@/library/stripeClient'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
	const rawBody = await request.text()
	const headersList = await headers()
	const stripeSignature = headersList.get('stripe-signature')

	if (stripeWebhookSecret && stripeSignature) {
		try {
			const event = stripeClient.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret)
			logger.info(`${apiPaths.stripe.webhook} event: `, event)
			return NextResponse.json({ message: 'success' }, { status: httpStatus.http200ok })
		} catch (error) {
			logger.error(`${apiPaths.stripe.webhook} error: `, error)
			return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
		}
	}
	return NextResponse.json({ message: basicMessages.serverError }, { status: httpStatus.http500serverError })
}
