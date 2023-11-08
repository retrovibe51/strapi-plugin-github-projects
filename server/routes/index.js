module.exports = [
  {
    method: 'GET',
    path: '/repos',   // localhost:1337/github-projects/repos
    handler: 'getReposController.index',
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
      // auth: false
    },
  },
  {
    method: 'POST',
    path: '/project',
    handler: 'projectController.create',
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: 'DELETE',
    path: '/project/:id',
    handler: 'projectController.delete',
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: 'POST',
    path: '/projects',
    handler: 'projectController.createAll',
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  ,
  {
    method: 'DELETE',
    path: '/projects',
    handler: 'projectController.deleteAll',
    config: {
      policies: ["admin::isAuthenticatedAdmin"],
    },
  },
  {
    method: 'GET',
    path: '/projects',
    handler: 'projectController.find',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/project/:id',
    handler: 'projectController.findOne',
    config: {
      auth: false
    },
  },
];
