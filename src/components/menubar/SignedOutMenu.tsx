import { websiteCopy } from '@/library/constants'
import Link from 'next/link'
import HomePageLink from './HomePageLink'
import MenuItem from './MenuItem'

export default function SignedOutMenu() {
	return (
		<nav className="fixed inset-x-0 top-0 flex h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menubar px-4 lg:px-8">
			<div className="w-full max-w-7xl mx-auto flex items-center justify-between">
				<HomePageLink />
				<div className="flex h-full items-center gap-x-6">
					<MenuItem href="/articles" text="Articles" />
					<MenuItem href="/sign-in" text="Sign in" />
					<div className="flex gap-x-2 items-center">
						<Link href={websiteCopy.CTAs.secondary.href} title={websiteCopy.linkDescriptions.howItWorks} className="button-secondary">
							{websiteCopy.CTAs.secondary.displayText}
						</Link>
						<Link href={websiteCopy.CTAs.primary.href} className="button-primary">
							{websiteCopy.CTAs.primary.displayText}
						</Link>
					</div>
				</div>
			</div>
		</nav>
	)
}
