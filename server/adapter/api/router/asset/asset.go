package asset

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
)

type assetRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := assetRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *assetRouter) initRoutes() {
	r.routes = []router.Route{
		router.NewPostRoute("assets", r.create),
	}
}

func (r *assetRouter) Routes() []router.Route {
	return r.routes
}
