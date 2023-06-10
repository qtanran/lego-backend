import { GlobalErrorTypes } from '../error'
export default function (modelName: string, errorType: GlobalErrorTypes, userKey = 'user') {
  return function (prototype, key: string, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const { ctx } = this
      const { id } = ctx.params
      const userId = ctx.state.user._id
      const certianRecord = await ctx.model[modelName].findOne({ id })
      if (!certianRecord || certianRecord[userKey].toString() !== userId) {
        return ctx.helper.error({ ctx, errorType })
      }
      await originalMethod.apply(this, args)
    }
  }
}
