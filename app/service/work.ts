import { Service } from 'egg'
import { nanoid } from 'nanoid'

export default class WorkService extends Service {
  async createEmptyWork(payload) {
    const { ctx } = this
    // 拿到对应的 user id
    const { username, _id } = ctx.state.user
    // 拿到一个独一无二的 URL id
    const uuid = nanoid(6)
    const newEmptyWork = {
      ...payload,
      user: _id,
      author: username,
      uuid
    }
    return ctx.model.Work.create(newEmptyWork)
  }
}
