import { Controller } from 'egg'
import inputValidate from '../decorator/inputValidate'

const workCreateRules = {
  title: 'string'
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
   * 创建作品
   */
  @inputValidate(workCreateRules, 'workValidateFail')
  async createWork() {
    const { ctx, service } = this
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
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
   * 检查权限
   * @param id
   */
  async checkPermission(id: number) {
    const { ctx } = this
    // 获取当前用户的 ID
    const userId = ctx.state.user._id
    // 查询作品信息
    const certianWork = await this.ctx.model.Work.findOne({ id })
    if (!certianWork) {
      return false
    }
    // 检查是否相等
    return certianWork.user.toString() === userId
  }

  /**
   * 更新作品
   */
  async update() {
    const { ctx } = this
    const { id } = ctx.params
    const permission = await this.checkPermission(id)
    if (!permission) {
      return ctx.helper.error({ ctx, errorType: 'workNoPermissionFail' })
    }
    const payload = ctx.request.body
    const res = await this.ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true }).lean()
    ctx.helper.success({ ctx, res })
  }

  /**
   * 删除作品
   */
  async delete() {
    const { ctx } = this
    const { id } = ctx.params
    const permission = await this.checkPermission(id)
    if (!permission) {
      return ctx.helper.error({ ctx, errorType: 'workNoPermissionFail' })
    }
    const res = await this.ctx.model.Work.findOneAndDelete({ id }).select('_id id title').lean()
    ctx.helper.success({ ctx, res })
  }
}
