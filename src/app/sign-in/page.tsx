'use client'
import { CheckboxIcon } from '@/components/Icons'
import PageContainer from '@/components/PageContainer'
import { apiPaths, dataTestIdNames, testPasswords, testUsers } from '@/library/constants'
import logger from '@/library/logger'
import { useAuthorisation } from '@/providers/authorisation'
import type { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export default function SignInPage() {
	const { setBrowserSafeUser } = useAuthorisation()
	const router = useRouter()
	const preFillForConvenience = false
	const [formData, setFormData] = useState<SignInPOSTbody>({
		email: preFillForConvenience ? testUsers.permanentTestUser.email : '',
		password: preFillForConvenience ? testPasswords.good : '',
		staySignedIn: false,
	})
	const [error, setError] = useState('')

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		setError('')

		try {
			const response = await fetch(apiPaths.authentication.signIn, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					staySignedIn: formData.staySignedIn,
				} satisfies SignInPOSTbody),
			})

			const { message, fullBrowserSafeUser }: SignInPOSTresponse = await response.json()

			if (!response.ok || message !== 'success') {
				setError('Sorry, something went wrong')
			}

			if (!fullBrowserSafeUser) {
				setError('No account found with this email')
				return
			}

			setBrowserSafeUser(fullBrowserSafeUser)
			router.push('/dashboard')
			return
		} catch (error) {
			logger.error(error)
			setError('Sorry something went wrong')
		}
	}

	return (
		<PageContainer>
			<div className="max-w-md mx-auto mt-8 p-6">
				<h1>Sign In</h1>
				{error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}
				<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
					<div>
						<label htmlFor="email" className="block mb-1">
							Email
						</label>
						<input
							data-test-id={dataTestIdNames.signIn.emailInput}
							id="email"
							type="email"
							value={formData.email}
							autoComplete="work email"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									email: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block mb-1">
							Password
						</label>
						<input
							data-test-id={dataTestIdNames.signIn.passwordInput}
							id="password"
							type="password"
							value={formData.password}
							autoComplete="current-password"
							onChange={(event) =>
								setFormData((prev) => ({
									...prev,
									password: event.target.value,
								}))
							}
							required
							className="w-full"
						/>
					</div>

					<div className="flex gap-3">
						<div className="flex h-6 shrink-0 items-center">
							<div className="group grid size-4 grid-cols-1">
								<input
									data-test-id={dataTestIdNames.signIn.staySignedInCheckbox}
									id="stay-signed-in"
									name="stay-signed-in"
									type="checkbox"
									checked={formData.staySignedIn}
									onChange={(event) =>
										setFormData((prev) => ({
											...prev,
											staySignedIn: event.target.checked,
										}))
									}
								/>
								<CheckboxIcon />
							</div>
						</div>
						<label htmlFor="stay-signed-in" className="block text-sm/6 text-gray-900">
							Stay signed in
						</label>
					</div>

					<button data-test-id={dataTestIdNames.signIn.submitButton} type="submit" className="button-primary inline-block w-full">
						Sign In
					</button>
				</form>
			</div>
		</PageContainer>
	)
}
