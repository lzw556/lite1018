package monitoringpoint

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
)

type monitoringPointRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := monitoringPointRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *monitoringPointRouter) initRoutes() {
	r.routes = []router.Route{
		router.NewPostRoute("monitoringPoints", r.create),
	}
}

func (r *monitoringPointRouter) Routes() []router.Route {
	return r.routes
}
