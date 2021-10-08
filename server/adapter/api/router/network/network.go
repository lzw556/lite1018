package network

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type networkRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := networkRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *networkRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("networks", r.importNetwork),

		// GET
		router.NewGetRoute("networks/:id", r.getByID),
		router.NewGetRoute("networks", r.find),
		router.NewGetRoute("networks/:id/export", r.exportNetwork),

		// PUT
		router.NewPutRoute("networks/setting", r.updateSettingByGatewayID),

		// PATCH
		router.NewPatchRoute("networks/:id/devices", r.accessDevices),

		// DELETE
		router.NewDeleteRoute("networks/:id/devices/:deviceId", r.removeDeviceByID),
	}
}

func (r *networkRouter) Routes() []router.Route {
	return r.routes
}
