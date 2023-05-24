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
  }
}
