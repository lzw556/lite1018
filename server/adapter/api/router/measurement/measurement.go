package measurement

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type measurementRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := measurementRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *measurementRouter) initRoutes() {
	r.routes = []router.Route{

		// GET
		router.NewGetRoute("/measurementTypes/:id/parameters", r.getMeasurementTypeParameters),
	}
}

func (r *measurementRouter) Routes() []router.Route {
	return r.routes
}
