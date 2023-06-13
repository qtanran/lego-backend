import userErrorMessage from './user'
import workErrorMessage from './work'
import utilsErrorMessages from './utils'

export type GlobalErrorTypes = keyof (typeof userErrorMessage &
  typeof workErrorMessage &
  typeof utilsErrorMessages)

export const globalErrorMessages = {
  ...userErrorMessage,
  ...workErrorMessage,
  ...utilsErrorMessages
}
