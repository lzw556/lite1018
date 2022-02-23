package property

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type propertyRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := propertyRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *propertyRouter) initRoutes() {
	r.routes = []router.Route{
		// GET
		router.NewGetRoute("properties", r.find),
	}
}

func (r *propertyRouter) Routes() []router.Route {
	return r.routes
}
