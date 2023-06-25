import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference, assign } from 'lodash/fp'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete'
}
interface ModelMapping {
  mongoose: string
  casl: string
}
interface IOptions {
  action?: string
  key?: string
  value?: { type: 'params' | 'body'; valueKey: string }
}

const fieldsOptions = { fieldsFrom: rule => rule.fields || [] }
const defaultSearchOptions = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' }
}

/**
 *
 * @param modelName model 的名称，可以是普通的字符串，也可以是 casl 和 mongoose 的映射关系
 * @param errorType 返回的错误类型，来自 GlobalErrorTypes
 * @param options 特殊配置选项，可以自定义 action 以及查询条件，详见上面的 IOptions 选项
 */
export default function (
  modelName: string | ModelMapping,
  errorType: GlobalErrorTypes,
  options?: IOptions
) {
  return function (_prototype, _key: string, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const { ctx } = this
      const { method } = ctx.request
      const {
        key,
        value: { type, valueKey }
      } = assign(defaultSearchOptions, options || {})

      // 构建一个 query
      const source = type === 'params' ? ctx.params : ctx.request.body
      const query = {
        [key]: source[valueKey]
      }
      // 构建 modelname
      const mongooseModelName = typeof modelName === 'string' ? modelName : modelName.mongoose
      const caslModelName = typeof modelName === 'string' ? modelName : modelName.casl
      const action = options && options.action ? options.action : caslMethodMapping[method]
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      let permission = false
      let keyPermission = true
      // 获取定义的 roles
      const ability = defineRoles(ctx.state.user)
      // 所以我们需要先获取 rule 来判断一下，看他是否存在对应的条件
      const rule = ability.relevantRuleFor(action, caslModelName)
      if (rule && rule.conditions) {
        // 假如存在 condition, 先查询对应数据
        const certianRecord = await ctx.model[mongooseModelName].findOne(query).lean()
        permission = ability.can(action, subject(caslModelName, certianRecord))
      } else {
        permission = ability.can(action, caslModelName)
      }
      // 判断 rule 中是否有对应的受限字段
      if (rule?.fields) {
        const fields = permittedFieldsOf(ability, action, caslModelName, fieldsOptions)
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
