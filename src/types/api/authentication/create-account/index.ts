import type { AuthenticationMessages, BasicMessages, IllegalCharactersMessages } from '@/types/definitions/responseMessages'
import type { FullClientSafeUser, NewBaseUser } from '@/types/definitions/users'

export interface CreateAccountPOSTbody extends Omit<NewBaseUser, 'hashedPassword' | 'emailConfirmed' | 'cachedTrialExpired'> {
	password: string
	staySignedIn: boolean
}

export interface CreateAccountPOSTresponse {
	message: BasicMessages | AuthenticationMessages | IllegalCharactersMessages
	user?: FullClientSafeUser
}
