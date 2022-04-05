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
		router.NewPostRoute("devices/:id/alarmRules", r.addAlarmRulesByID),

		// GET
		router.NewGetRoute("devices", r.find),
		router.NewGetRoute("devices/:id", r.get),
		router.NewGetRoute("devices/:id/settings", r.getSettingByID),
		router.NewGetRoute("devices/:id/data", r.findDataByID),
		router.NewGetRoute("devices/:id/download/data", r.downloadDataByID),
		router.NewGetRoute("devices/:id/data/:timestamp", r.getDataByIDAndTimestamp),
		router.NewGetRoute("devices/:id/download/data/:timestamp", r.downloadDataByIDAndTimestamp),
		router.NewGetRoute("devices/:id/runtime", r.findRuntimeDataByID),
		router.NewGetRoute("devices/:id/alarmRules", r.findAlarmRulesByID),

		router.NewGetRoute("devices/defaultSettings", r.defaultSettings),
		router.NewGetRoute("check/devices/:mac", r.checkMacAddress),

		router.NewGetRoute("devices/:id/events", r.findEventsByID),

		// PUT
		router.NewPutRoute("devices/:id", r.update),

		// PATCH
		router.NewPatchRoute("devices/:id/settings", r.updateSettingByID),

		// DELETE
		router.NewDeleteRoute("devices/:id", r.delete),
		router.NewDeleteRoute("devices/:id/data", r.removeDataByID),
		router.NewDeleteRoute("devices/:id/events", r.removeEventsByID),
		router.NewDeleteRoute("devices/:id/alarmRules", r.removeAlarmRulesByID),
	}
}

func (r *deviceRouter) Routes() []router.Route {
	return r.routes
}
