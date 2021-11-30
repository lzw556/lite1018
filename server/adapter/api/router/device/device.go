package device

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type deviceRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := deviceRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *deviceRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("devices", r.create),
		router.NewPostRoute("devices/:id/commands/:cmd", r.executeCommand),
		router.NewPostRoute("devices/:id/upgrade", r.upgrade),

		// GET
		router.NewGetRoute("devices/statistics", r.statistic),
		router.NewGetRoute("devices/groupBy/asset", r.findGroupByAsset),
		router.NewGetRoute("devices", r.paging),
		router.NewGetRoute("devices/:id", r.getByID),
		router.NewGetRoute("devices/:id/children", r.getChildren),
		router.NewGetRoute("devices/:id/settings", r.getSettingByID),
		router.NewGetRoute("devices/checkMacAddress/:mac", r.checkMacAddress),
		router.NewGetRoute("devices/:id/data", r.findDataByID),
		router.NewGetRoute("devices/:id/download/data", r.downloadDataByID),

		// PUT
		router.NewPutRoute("devices/:id", r.updateByID),

		// PATCH
		router.NewPatchRoute("devices/:id/setting", r.updateSettingByID),
		router.NewPatchRoute("devices/:id/mac/:mac", r.replaceByID),

		// DELETE
		router.NewDeleteRoute("devices/:id", r.removeByID),
		router.NewDeleteRoute("devices/:id/data", r.removeDataByID),
	}
}

func (r *deviceRouter) Routes() []router.Route {
	return r.routes
}
