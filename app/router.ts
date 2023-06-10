import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app
  const jwtMiddleware = app.jwt as any
  router.get('/', controller.home.index)
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/getUserInfo', jwtMiddleware, controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellphone)
  router.get('/api/users/passport/gitee', controller.user.oauth)
  router.get('/api/users/passport/gitee/callback', controller.user.oauthByGitee)

  router.post('/api/works', jwtMiddleware, controller.work.createWork)
  router.get('/api/works', jwtMiddleware, controller.work.myList)
  router.get('/api/templates', controller.work.templateList)
  router.patch('/api/works/:id', jwtMiddleware, controller.work.update)
  router.delete('/api/works/:id', jwtMiddleware, controller.work.delete)
  router.post('/api/works/publish/:id', jwtMiddleware, controller.work.publishWork)
  router.post('/api/works/publish-template/:id', jwtMiddleware, controller.work.publishTemplate)
}
