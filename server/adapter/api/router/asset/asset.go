package asset

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

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
		// POST
		router.NewPostRoute("assets", r.create),

		// GET
		router.NewGetRoute("assets", r.paging),
		router.NewGetRoute("assets/:id/statistics", r.statistic),
		router.NewGetRoute("assets/statistics", r.statisticAll),
		router.NewGetRoute("assets/:id", r.getByID),

		// PUT
		router.NewPutRoute("assets/:id", r.updateByID),

		// DELETE
		router.NewDeleteRoute("assets/:id", r.removeByID),
	}
}

func (r *assetRouter) Routes() []router.Route {
	return r.routes
}
