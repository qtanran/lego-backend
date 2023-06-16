import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete'
}

export default function (modelName: string, errorType: GlobalErrorTypes, _userKey = 'user') {
  return function (_prototype, _key: string, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const { ctx } = this
      const { id } = ctx.params
      const { method } = ctx.request
      const action = caslMethodMapping[method]
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      let permission = false
      // 获取定义的 roles
      const ability = defineRoles(ctx.state.user)
      // 所以我们需要先获取 rule 来判断一下，看他是否存在对应的条件
      const rule = ability.relevantRuleFor(action, modelName)
      if (rule && rule.conditions) {
        // 假如存在 condition, 先查询对应数据
        const certianRecord = await ctx.model[modelName].findOne({ id }).lean()
        permission = ability.can(action, subject(modelName, certianRecord))
      } else {
        permission = ability.can(action, modelName)
      }

      if (!permission) {
        return ctx.helper.error({ ctx, errorType })
      }
      await originalMethod.apply(this, args)
    }
  }
}
