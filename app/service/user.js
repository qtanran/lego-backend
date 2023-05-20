const { Service } = require('egg')

class UserService extends Service {
  async createByEmail(payload) {
    const { ctx } = this
    const { username, password } = payload
    const userCreatedData = {
      username,
      password,
      email: username
    }
    return ctx.model.User.create(userCreatedData)
  }
  async findById(id) {
    return this.ctx.model.User.findById(id)
  }
  async findByUsername(username) {
    return this.ctx.model.User.findOne({ username })
  }
}

module.exports = UserService
