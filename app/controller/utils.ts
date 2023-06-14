import { Controller } from 'egg'
import * as sendToWormhole from 'stream-wormhole'
import { nanoid } from 'nanoid'
import { join, extname } from 'path'

export default class UtilsController extends Controller {
  async uploadMultipleFiles() {
    const { ctx, app } = this
    const parts = ctx.multipart()
    const urls: string[] = []
    let part
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part)
      } else {
        try {
          const savedOSSPath = join('test', nanoid(6) + extname(part.filename))
          const result = await ctx.oss.put(savedOSSPath, part)
          const { url } = result
          urls.push(url)
        } catch (e) {
          await sendToWormhole(part)
          ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } })
  }

  async uploadToOSS() {
    const { ctx, app } = this
    const stream = await ctx.getFileStream()
    const savedOSSPath = join('test', nanoid(6) + extname(stream.filename))
    try {
      const result = await ctx.oss.put(savedOSSPath, stream)
      app.logger.info(result)
      const { name, url } = result
      ctx.helper.success({ ctx, res: { name, url } })
    } catch (e) {
      await sendToWormhole(stream)
      ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
  }
}
