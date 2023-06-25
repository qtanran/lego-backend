import { Controller } from 'egg'
import { nanoid } from 'nanoid'
import inputValidate from '../decorator/inputValidate'
import checkPermission from '../decorator/checkPermission'
import { WorkProps } from '../model/work'

const workCreateRules = {
  title: 'string'
}
const channelCreateRules = {
  name: 'string',
  workId: 'number'
}

export interface IndexCondition {
  pageIndex?: number
  pageSize?: number
  select?: string | string[]
  populate?: { path?: string; select?: string } | string
  customSort?: Record<string, any>
  find?: Record<string, any>
}

export default class WorkController extends Controller {
  /**
   * 创建渠道
   */
  @inputValidate(channelCreateRules, 'channelValidateFail')
  async createChannel() {
    const { ctx } = this
    const { name, workId } = ctx.request.body
    const newChannel = {
      name,
      id: nanoid(6)
    }
    const res = await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      { $push: { channels: newChannel } }
    )
    if (res) {
      ctx.helper.success({ ctx, res: newChannel })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  /**
   * 获取作品的渠道列表
   */
  async getWorkChannel() {
    const { ctx } = this
    const { id } = ctx.params
    const certianWork = await ctx.model.Work.findOne({ id })
    if (certianWork) {
      const { channels } = certianWork
      ctx.helper.success({
        ctx,
        res: { count: (channels && channels.length) || 0, list: channels || [] }
      })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  /**
   * 更新渠道的名字
   */
  async updateChannelName() {
    const { ctx } = this
    const { id } = ctx.params
    const { name } = ctx.request.body
    const res = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      { $set: { 'channels.$.name': name } }
    )
    if (res) {
      ctx.helper.success({ ctx, res: { name } })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  /**
   * 删除渠道
   */
  async deleteChannel() {
    const { ctx } = this
    const { id } = ctx.params
    const work = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      { $pull: { channels: { id } } },
      { new: true }
    )
    if (work) {
      ctx.helper.success({ ctx, res: work })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  /**
   * 创建作品
   */
  @inputValidate(workCreateRules, 'workValidateFail')
  @checkPermission('Work', 'workNoPermissionFail')
  async createWork() {
    const { ctx, service } = this
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }

  /**
   * 复制作品
   */
  async copyWork() {
    const { ctx } = this
    const { id } = ctx.params
    try {
      const res = await ctx.service.work.copyWork(parseInt(id))
      ctx.helper.success({ ctx, res })
    } catch (e) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async myWork() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOne({ id }).lean()
    ctx.helper.success({ ctx, res })
  }

  async template() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOne<WorkProps>({ id }).lean()
    if (!res?.isPublic || !res?.isTemplate) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
    ctx.helper.success({ ctx, res })
  }

  /**
   * 获取我的作品
   */
  async myList() {
    const { ctx } = this
    const userId = ctx.state.user._id
    const { pageIndex, pageSize, isTemplate, title } = ctx.query
    const findCondition = {
      user: userId,
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) })
    }
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: findCondition,
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) })
    }
    const res = await ctx.service.work.getList(listCondition)
    ctx.helper.success({ ctx, res })
  }

  /**
   * 获取作品列表
   */
  async templateList() {
    const { ctx } = this
    const { pageIndex, pageSize } = ctx.query
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isPublic: true, isTemplate: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) })
    }
    const res = await ctx.service.work.getList(listCondition)
    ctx.helper.success({ ctx, res })
  }

  /**
   * 更新作品
   */
  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this
    const { id } = ctx.params
    const payload = ctx.request.body
    const res = await this.ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true }).lean()
    ctx.helper.success({ ctx, res })
  }

  /**
   * 删除作品
   */
  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOneAndDelete({ id }).select('_id id title').lean()
    ctx.helper.success({ ctx, res })
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async publish(isTemplate: boolean) {
    const { ctx } = this
    const url = await this.service.work.publish(ctx.params.id, isTemplate)
    ctx.helper.success({ ctx, res: { url } })
  }
  async publishWork() {
    await this.publish(false)
  }
  async publishTemplate() {
    await this.publish(true)
  }
}
