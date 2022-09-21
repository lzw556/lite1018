package project

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type projectRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := projectRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *projectRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("projects", r.create),
		router.NewPostRoute("projects/:id/token", r.genAccessToken),

		// GET
		router.NewGetRoute("projects", r.find),
		router.NewGetRoute("projects/:id", r.get),
		router.NewGetRoute("projects/:id/users", r.getAllocUsers),
		router.NewGetRoute("my/projects", r.getMyProjects),
		router.NewGetRoute("my/projects/:id", r.getMyProject),

		// PUT
		router.NewPutRoute("projects/:id", r.update),

		// PATCH
		router.NewPatchRoute("projects/:id/users", r.allocUsers),

		// DELETE
		router.NewDeleteRoute("projects/:id", r.delete),
	}
}

func (r projectRouter) Routes() []router.Route {
	return r.routes
}
