const dotenv = require('dotenv')
dotenv.config()

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/lego',
        options: {
          // useNewUrlParser: true,
        }
      }
    }
  })

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1683856611106_6999'

  // add your middleware config here
  config.middleware = ['customError']

  config.security = {
    csrf: {
      enable: false
    }
  }

  config.jwt = {
    secret: '1234567890'
  }

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0
    }
  }

  // gitee oauth config
  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code'
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    aliCloudConfig: {
      accessKeyId: process.env.ALC_ACCESS_KEY,
      accessKeySecret: process.env.ALC_SECRET_KEY,
      endpoint: 'dysmsapi.aliyuncs.com'
    },
    giteeOauthConfig
  }

  return {
    ...config,
    ...userConfig
  }
}
