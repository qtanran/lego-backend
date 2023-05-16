'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/:id', controller.user.show)
};
