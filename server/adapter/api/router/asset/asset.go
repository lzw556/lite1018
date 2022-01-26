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
		router.NewPostRoute("assets/:id", r.update),

		// GET
		router.NewGetRoute("assets", r.find),
		router.NewGetRoute("assets/:id/statistics", r.statisticalAsset),
		router.NewGetRoute("assets/statistics", r.statisticalAssets),
		router.NewGetRoute("assets/:id", r.get),
		router.NewGetRoute("assets/:id/children", r.getChildren),

		// DELETE
		router.NewDeleteRoute("assets/:id", r.delete),
	}
}

func (r *assetRouter) Routes() []router.Route {
	return r.routes
}
