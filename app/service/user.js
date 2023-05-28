const { Service } = require('egg')
const $Dysmsapi = require('@alicloud/dysmsapi20170525')

class UserService extends Service {
  async createByEmail(payload) {
    const { ctx } = this
    const { username, password } = payload
    const hash = await ctx.genHash(password)
    const userCreatedData = {
      username,
      password: hash,
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

  /**
   * 调用阿里云服务，发送短信验证码
   * @param phoneNumber 手机号
   * @param veriCode 验证码
   * @returns {Promise<SendSmsResponse>}
   */
  async sendSMS(phoneNumber, veriCode) {
    const { app } = this
    // 配置参数
    const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: process.env.SIGN_NAME,
      templateCode: process.env.TEMPLATE_CODE,
      templateParam: `{\"code\":\"${veriCode}\"}`
    })
    return await app.ALClient.sendSms(sendSMSRequest)
  }

  /**
   * 通过手机号登录
   * @param cellphone 手机号
   * @returns {Promise<string>}
   */
  async loginByCellphone(cellphone) {
    const { ctx, app } = this
    const user = await this.findByUsername(cellphone)
    // 检查 user 记录是否存在
    if (user) {
      return app.jwt.sign({ username: user.username }, app.config.jwt.secret)
    }
    const newUser = await ctx.model.User.create({
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `乐高${cellphone.slice(-4)}`,
      type: 'cellphone'
    })
    return app.jwt.sign({ username: newUser.username }, app.config.jwt.secret)
  }

  /**
   * 获取码云的 access_token
   * @param code
   * @returns {Promise<*>}
   */
  async getAccessToken(code) {
    const { ctx, app } = this
    const { cid, secret, redirectURL, authURL } = app.config.giteeOauthConfig
    const { data } = await ctx.curl(authURL, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: cid,
        redirect_uri: redirectURL,
        client_secret: secret
      }
    })
    app.logger.info(data)
    return data.access_token
  }

  /**
   * 获取码云的用户数据
   * @param access_token
   * @returns {Promise<any>}
   */
  async getGiteeUserData(access_token) {
    const { ctx, app } = this
    const { giteeUserAPI } = app.config.giteeOauthConfig
    const { data } = await ctx.curl(`${giteeUserAPI}?access_token=${access_token}`, {
      dataType: 'json'
    })
    return data
  }

  /**
   * 通过码云登录
   * @param code
   * @returns {Promise<string>}
   */
  async loginByGitee(code) {
    const { ctx, app } = this
    // 获取 access_token
    const accessToken = await this.getAccessToken(code)
    // 获取用户的信息
    const user = await this.getGiteeUserData(accessToken)
    // 检查用户信息是否存在
    const { id, name, avatar_url, email } = user
    const stringId = id.toString()
    // 假如已经存在
    const existUser = await this.findByUsername(`Gitee${stringId}`)
    if (existUser) {
      return app.jwt.sign({ username: existUser.username }, app.config.jwt.secret)
    }
    // 假如不存在，新建用户
    const newUser = await ctx.model.User.create({
      oauthID: stringId,
      provider: 'gitee',
      username: `Gitee${stringId}`,
      picture: avatar_url,
      nickName: name,
      email,
      type: 'oauth'
    })
    return app.jwt.sign({ username: newUser.username }, app.config.jwt.secret)
  }
}

module.exports = UserService
