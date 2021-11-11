package system

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type systemRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := systemRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *systemRouter) initRoutes() {
	r.routes = []router.Route{
		// GET
		router.NewGetRoute("system", r.get),
	}
}

func (r systemRouter) Routes() []router.Route {
	return r.routes
}
