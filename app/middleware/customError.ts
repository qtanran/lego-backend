import { Context } from 'egg'

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next()
    } catch (error: any) {
      if (error?.status === 401) {
        return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
      } else if (error?.status === 400) {
        if (ctx.path === '/api/utils/upload-img') {
          return ctx.helper.error({
            ctx,
            errorType: 'imageUploadFileFormatError',
            error: error.message
          })
        }
        throw error
      }
      throw error
    }
  }
}
