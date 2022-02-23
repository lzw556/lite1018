package alarm

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type alarmRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := alarmRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *alarmRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("alarmRules", r.createAlarmRule),

		// GET
		router.NewGetRoute("alarmRules", r.findAlarmRules),
		router.NewGetRoute("alarmRules/:id", r.getAlarmRule),
	}
}

func (r *alarmRouter) Routes() []router.Route {
	return r.routes
}
