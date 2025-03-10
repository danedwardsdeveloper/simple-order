'use client'
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useContext, useState } from 'react'

interface UiContextType {
	mobileMenuOpen: boolean
	setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
	toggleMobileMenuOpen: () => void

	merchantMode: boolean
	setMerchantMode: Dispatch<SetStateAction<boolean>>
	toggleMerchantMode: () => void

	includeVat: boolean
	setIncludeVat: Dispatch<SetStateAction<boolean>>
	toggleIncludeVat: () => void
}

const UiContext = createContext<UiContextType | undefined>(undefined)

// ToDo: store the merchantMode in local storage or it's very annoying

export function UiProvider({ children }: { children: ReactNode }) {
	// Default needs to be merchant mode, or new free trials can't invite customers
	const [merchantMode, setMerchantMode] = useState(true)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	function toggleMerchantMode() {
		setMerchantMode((current) => !current)
	}

	function toggleMobileMenuOpen() {
		setMobileMenuOpen((current) => !current)
	}

	const [includeVat, setIncludeVat] = useState(false)
	const toggleIncludeVat = () => {
		setIncludeVat((current) => !current)
	}

	const value = {
		mobileMenuOpen,
		setMobileMenuOpen,
		toggleMobileMenuOpen,

		merchantMode,
		setMerchantMode,
		toggleMerchantMode,

		includeVat,
		setIncludeVat,
		toggleIncludeVat,
	}

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
	const context = useContext(UiContext)
	if (context === undefined) throw new Error('useUi must be used within a UiProvider')
	return context
}
