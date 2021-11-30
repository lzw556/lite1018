package role

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type roleRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := roleRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *roleRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("/roles", r.create),

		// PUT
		router.NewPutRoute("/roles/:id", r.update),

		// GET
		router.NewGetRoute("/roles", r.paging),
		router.NewGetRoute("/roles/:id", r.get),
		router.NewGetRoute("/my/casbin", r.casbin),

		// PATCH
		router.NewPatchRoute("/roles/:id/menus", r.allocMenus),
		router.NewPatchRoute("/roles/:id/permissions", r.allocPermissions),
	}
}

func (r *roleRouter) Routes() []router.Route {
	return r.routes
}
