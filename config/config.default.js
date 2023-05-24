/* eslint valid-jsdoc: "off" */

'use strict'

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

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  return {
    ...config,
    ...userConfig
  }
}
