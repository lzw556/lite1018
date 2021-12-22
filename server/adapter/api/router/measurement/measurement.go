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
		// POST
		router.NewPostRoute("measurements", r.create),

		// GET
		router.NewGetRoute("measurements", r.find),
		router.NewGetRoute("measurements/fields", r.getFields),
		router.NewGetRoute("measurements/statistics", r.statistical),
		router.NewGetRoute("measurements/:id", r.getByID),
		router.NewGetRoute("measurements/:id/statistics", r.getStatistic),
		router.NewGetRoute("measurements/:id/data", r.getData),

		router.NewGetRoute("/check/deviceBinding/:mac", r.checkDeviceBinding),

		// PUT
		router.NewPutRoute("measurements/:id", r.updateByID),

		// PATCH
		router.NewPatchRoute("measurements/:id/settings", r.updateSettings),
		router.NewPatchRoute("measurements/:id/devices", r.bindingDevices),

		// DELETE
		router.NewDeleteRoute("measurements/:id", r.deleteByID),
	}
}

func (r *measurementRouter) Routes() []router.Route {
	return r.routes
}
