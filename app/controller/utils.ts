import { Controller } from 'egg'
import * as sendToWormhole from 'stream-wormhole'
import { nanoid } from 'nanoid'
import { join, extname } from 'path'

export default class UtilsController extends Controller {
  splitIdAndUUID(str = '') {
    const result = { id: '', uuid: '' }
    if (!str || !str.includes('-')) {
      return result
    }
    const firstDashIndex = str.indexOf('-')
    result.id = str.slice(0, firstDashIndex)
    result.uuid = str.slice(firstDashIndex + 1)
    return result
  }

  /**
   * 渲染 H5页面
   */
  async renderH5Page() {
    const { ctx } = this
    const { idAndUuid } = ctx.params
    const query = this.splitIdAndUUID(idAndUuid)
    try {
      const pageData = await this.service.utils.renderToPageData(query)
      await ctx.render('page.nj', pageData)
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'h5WorkNotExistError' })
    }
  }

  /**
   * 多文件上传
   */
  async uploadMultipleFiles() {
    const { ctx, app } = this
    const { fileSize } = app.config.multipart
    const parts = ctx.multipart({ limits: { fileSize: fileSize as number } })
    const urls: string[] = []
    let part
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part)
      } else {
        try {
          const savedOSSPath = join('test', nanoid(6) + extname(part.filename))
          const { url } = await ctx.oss.put(savedOSSPath, part)
          urls.push(url)
          if (part.truncated) {
            await ctx.oss.delete(savedOSSPath)
            return ctx.helper.error({
              ctx,
              errorType: 'imageUploadFileSizeError',
              error: `Reach fileSize limit ${fileSize} bytes`
            })
          }
        } catch (e) {
          await sendToWormhole(part)
          ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } })
  }
}
