package resource

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type resourceRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := resourceRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *resourceRouter) initRoutes() {
	r.routes = []router.Route{

		// GET
		router.NewGetRoute("resources/assets/:name", r.getAsset),
	}
}

func (r resourceRouter) Routes() []router.Route {
	return r.routes
}
