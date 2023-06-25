import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference } from 'lodash'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete'
}

const options = { fieldsFrom: rule => rule.fields || [] }

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
      let keyPermission = true
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
      // 判断 rule 中是否有对应的受限字段
      if (rule?.fields) {
        const fields = permittedFieldsOf(ability, action, modelName, options)
        if (fields.length > 0) {
          const payloadKeys = Object.keys(ctx.request.body)
          const diffKeys = difference(payloadKeys, fields)
          keyPermission = diffKeys.length === 0
        }
      }
      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType })
      }
      await originalMethod.apply(this, args)
    }
  }
}
