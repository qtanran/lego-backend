import { Controller } from 'egg'
import inputValidate from '../decorator/inputValidate'

const workCreateRules = {
  title: 'string'
}

interface IndexCondition {
  pageIndex?: number
  pageSize?: number
  select?: string | string[]
  populate?: { path?: string; select?: string }
  customSort?: Record<string, any>
  find?: Record<string, any>
}

export default class WorkController extends Controller {
  @inputValidate(workCreateRules, 'workValidateFail')
  async createWork() {
    const { ctx, service } = this
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }
}
