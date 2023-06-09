import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'
import * as dotenv from 'dotenv'
dotenv.config()

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1683856611106_6999'

  // add your middleware config here
  // config.middleware = []

  config.security = {
    csrf: {
      enable: false
    }
  }

  config.view = {
    defaultViewEngine: 'nunjucks'
  }

  config.jwt = {
    enable: true,
    secret: process.env.JWT_SECRET || '',
    match: ['/api/users/getUserInfo', '/api/works', '/api/utils/upload-img', '/api/channel']
  }

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/lego',
      options: {}
    }
  }

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0
    }
  }

  config.multipart = {
    whitelist: ['.png', '.jpg', '.gif', '.webp'],
    fileSize: '1mb'
  }

  config.cors = {
    origin: 'http://localhost:8080',
    allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH'
  }

  config.oss = {
    client: {
      accessKeyId: process.env.ALC_ACCESS_KEY || '',
      accessKeySecret: process.env.ALC_SECRET_KEY || '',
      bucket: 'lego-backend-qu',
      endpoint: 'oss-cn-beijing.aliyuncs.com'
    }
  }

  // gitee oauth config
  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user'
  }

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
    aliCloudConfig: {
      accessKeyId: process.env.ALC_ACCESS_KEY,
      accessKeySecret: process.env.ALC_SECRET_KEY,
      endpoint: 'dysmsapi.aliyuncs.com'
    },
    giteeOauthConfig,
    H5BaseURL: 'http://localhost:7001/api/pages'
  }

  return {
    ...config,
    ...bizConfig
  }
}
