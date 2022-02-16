package device

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
)

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
		router.NewGetRoute("devices", r.find),
		router.NewGetRoute("devices/:id", r.get),
		router.NewGetRoute("devices/:id/children", r.getChildren),
		router.NewGetRoute("devices/:id/settings", r.getSettingByID),
		router.NewGetRoute("devices/:id/data", r.findDataByID),
		router.NewGetRoute("devices/:id/data/last", r.getLastDataByID),
		router.NewGetRoute("devices/:id/data/runtime", r.findRuntimeDataByID),
		router.NewGetRoute("devices/:id/data/wave", r.findWaveDataByID),
		router.NewGetRoute("devices/:id/data/wave/:timestamp", r.getWaveDataByID),
		router.NewGetRoute("devices/:id/download/data/wave/:timestamp", r.downloadWaveDataByID),
		router.NewGetRoute("devices/:id/download/data", r.downloadDataByID),
		router.NewGetRoute("devices/defaultSettings", r.defaultSettings),
		router.NewGetRoute("check/devices/:mac", r.checkMacAddress),

		// PUT
		router.NewPutRoute("devices/:id", r.update),

		// PATCH
		router.NewPatchRoute("devices/:id/settings", r.updateSettingByID),
		router.NewPatchRoute("devices/:id/mac/:mac", r.replaceByID),

		// DELETE
		router.NewDeleteRoute("devices/:id", r.delete),
		router.NewDeleteRoute("devices/:id/data", r.removeDataByID),
	}
}

func (r *deviceRouter) Routes() []router.Route {
	return r.routes
}
