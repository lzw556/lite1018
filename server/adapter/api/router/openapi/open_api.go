package openapi

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type openApiRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := openApiRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *openApiRouter) initRoutes() {
	r.routes = []router.Route{
		router.NewGetRoute("v1/devices", r.findDevices),
		router.NewGetRoute("v1/devices/:mac", r.getDeviceByMac),
		router.NewGetRoute("v1/devices/:mac/data", r.findDeviceDataByMac),
		router.NewGetRoute("v1/assets", r.findAssets),
		router.NewGetRoute("v1/assets/:id", r.getAsset),
		router.NewGetRoute("v1/monitoringPoints", r.findMonitoringPoints),
		router.NewGetRoute("v1/monitoringPoints/:id", r.getMonitoringPoint),
	}
}

func (r *openApiRouter) Routes() []router.Route {
	return r.routes
}
