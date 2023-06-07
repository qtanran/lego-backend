import userErrorMessage from './user'
import workErrorMessage from './work'

export type GlobalErrorTypes = keyof (typeof userErrorMessage & typeof workErrorMessage)

export const globalErrorMessages = {
  ...userErrorMessage,
  ...workErrorMessage
}
