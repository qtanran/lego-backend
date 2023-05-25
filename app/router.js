'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/getUserInfo', app.jwt, controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
}
