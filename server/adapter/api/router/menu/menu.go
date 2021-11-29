package menu

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type menuRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := menuRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *menuRouter) initRoutes() {
	r.routes = []router.Route{
		// GET
		router.NewGetRoute("/my/menus", r.myMenus),
		router.NewGetRoute("/menus/tree", r.tree),
	}
}

func (r *menuRouter) Routes() []router.Route {
	return r.routes
}
