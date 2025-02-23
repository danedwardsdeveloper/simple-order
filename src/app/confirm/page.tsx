'use client'
import Spinner from '@/components/Spinner'
import { Suspense } from 'react'
import ConfirmEmailResponse from './ConfirmEmailResponse'

export default function ConfirmEmailPage() {
	return (
		<>
			<h1>Confirm your email</h1>
			<Suspense fallback={<Spinner />}>
				<ConfirmEmailResponse />
			</Suspense>
		</>
	)
}
