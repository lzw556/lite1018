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
		router.NewGetRoute("measurements/statistics", r.statisticalMeasurements),
		router.NewGetRoute("measurements/:id", r.get),
		router.NewGetRoute("measurements/:id/statistics", r.statisticalMeasurement),
		router.NewGetRoute("measurements/:id/data", r.findDataByID),
		router.NewGetRoute("measurements/:id/waveData", r.findWaveDataTimestamp),
		router.NewGetRoute("measurements/:id/waveData/:timestamp", r.findWaveDataByTimestamp),
		router.NewGetRoute("measurements/:id/waveData/:timestamp/download", r.downloadWaveData),

		router.NewGetRoute("/check/deviceBinding/:mac", r.checkDeviceBinding),

		// PUT
		router.NewPutRoute("measurements/:id", r.update),

		// PATCH
		router.NewPatchRoute("measurements/:id/settings", r.updateSettings),
		router.NewPatchRoute("measurements/:id/devices", r.bindingDevices),

		// DELETE
		router.NewDeleteRoute("measurements/:id", r.delete),
		router.NewDeleteRoute("measurements/:id/data", r.removeDataByID),
	}
}

func (r *measurementRouter) Routes() []router.Route {
	return r.routes
}
