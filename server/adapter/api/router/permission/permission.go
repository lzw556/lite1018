package permission

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type permissionRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := permissionRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *permissionRouter) initRoutes() {
	r.routes = []router.Route{
		// GET
		router.NewGetRoute("/permissions", r.paging),
		router.NewGetRoute("/permissions/withGroup", r.withGroup),
	}
}

func (r permissionRouter) Routes() []router.Route {
	return r.routes
}
