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
		router.NewPostRoute("alarmRuleTemplates", r.createAlarmRuleTemplate),
		router.NewPostRoute("alarmRules", r.createAlarmRule),

		// GET
		router.NewGetRoute("alarmRuleTemplates", r.pagingAlarmRuleTemplates),
		router.NewGetRoute("alarmRuleTemplates/:id", r.getAlarmRuleTemplate),
		router.NewGetRoute("alarmRules", r.pagingAlarmRules),
		router.NewGetRoute("alarmRules/:id", r.getAlarmRules),
		router.NewGetRoute("alarmRecords", r.pagingAlarmRecords),
		router.NewGetRoute("alarmRules/check/:name", r.checkAlarmRule),
		router.NewGetRoute("alarmStatistics", r.alarmStatistics),

		// PUT
		router.NewPutRoute("alarmRuleTemplates/:id", r.updateAlarmRuleTemplate),
		router.NewPutRoute("alarmRules/:id", r.updateAlarmRule),

		// DELETE
		router.NewDeleteRoute("alarmRuleTemplates/:id", r.removeAlarmRuleTemplate),
		router.NewDeleteRoute("alarmRules/:id", r.removeAlarmRule),
	}
}

func (r *alarmRouter) Routes() []router.Route {
	return r.routes
}
