'use strict'

/** @type Egg.EggPlugin */
module.exports = {
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  bcrypt: {
    enable: true,
    package: 'egg-bcrypt'
  },
  jwt: {
    enable: true,
    package: 'egg-jwt'
  },
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  cors: {
    enable: true,
    package: 'egg-cors'
  }
}
