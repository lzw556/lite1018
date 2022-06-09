package monitoringpoint

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
)

type monitoringPointRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := monitoringPointRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *monitoringPointRouter) initRoutes() {
	r.routes = []router.Route{
		router.NewPostRoute("monitoringPoints", r.create),
		router.NewPostRoute("monitoringPoints/:id/bindDevice", r.bindDevice),
		router.NewPostRoute("monitoringPoints/:id/unbindDevice", r.unbindDevice),

		router.NewGetRoute("monitoringPoints", r.find),
		router.NewGetRoute("monitoringPoints/:id", r.get),
		router.NewGetRoute("monitoringPoints/:id/data", r.findDataByID),
		router.NewGetRoute("monitoringPoints/:id/data/:timestamp", r.getDataByIDAndTimestamp),

		router.NewPutRoute("monitoringPoints/:id", r.update),

		router.NewDeleteRoute("monitoringPoints/:id", r.delete),
	}
}

func (r *monitoringPointRouter) Routes() []router.Route {
	return r.routes
}
