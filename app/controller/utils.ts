import { Controller } from 'egg'
const sharp = require('sharp')
import { nanoid } from 'nanoid'
import { join, extname } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

export default class UtilsController extends Controller {
  pathToURL(path: string) {
    const { app } = this
    return path.replace(app.config.baseDir, app.config.baseUrl)
  }

  async fileUploadByStream() {
    const { ctx, app } = this
    const stream = await this.ctx.getFileStream()
    const uid = nanoid(6)
    const savedFilePath = join(app.config.baseDir, 'uploads', uid + extname(stream.filename))
    const savedThumbnailPath = join(
      app.config.baseDir,
      'uploads',
      uid + '_thumbnail' + extname(stream.filename)
    )
    const target = createWriteStream(savedFilePath)
    const target2 = createWriteStream(savedThumbnailPath)
    const savePromise = pipeline(stream, target)
    const transformer = sharp().resize({ width: 300 })
    const thumbnailPromise = pipeline(stream, transformer, target2)
    try {
      await Promise.all([savePromise, thumbnailPromise])
    } catch (e) {
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
    ctx.helper.success({
      ctx,
      res: { url: this.pathToURL(savedFilePath), thumbnailUrl: this.pathToURL(savedThumbnailPath) }
    })
  }
}
