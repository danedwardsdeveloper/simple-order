export const basicMessages = {
  success: 'success',
  serverError: 'server error',
  parametersMissing: 'parameters missing',
  databaseError: 'database error',
} as const

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages]

export const authorisationMessages = {
  invalidCredentials: 'invalid credentials',
  tokenMissing: 'token missing',
  tokenInvalid: 'token invalid',
  tokenExpired: 'token expired',
  userNotFound: 'user not found',
  emailNotConfirmed: 'email not confirmed',
  unauthorised: 'unauthorised',
  authorisationError: 'authorisation error',
} as const

export type AuthorisationMessages = (typeof authorisationMessages)[keyof typeof authorisationMessages]