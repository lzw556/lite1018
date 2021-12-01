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
		router.NewGetRoute("alarmRecords/:id", r.getAlarmRecord),
		router.NewGetRoute("alarmStatistics", r.alarmStatistics),

		router.NewGetRoute("check/alarmRules/:name", r.checkAlarmRule),

		// PUT
		router.NewPutRoute("alarmRuleTemplates/:id", r.updateAlarmRuleTemplate),
		router.NewPutRoute("alarmRules/:id", r.updateAlarmRule),

		// PATCH
		router.NewPatchRoute("alarmRecords/:id/acknowledge", r.acknowledgeAlarmRecord),

		// DELETE
		router.NewDeleteRoute("alarmRuleTemplates/:id", r.removeAlarmRuleTemplate),
		router.NewDeleteRoute("alarmRules/:id", r.removeAlarmRule),
		router.NewDeleteRoute("alarmRecords/:id", r.removeAlarmRecord),
	}
}

func (r *alarmRouter) Routes() []router.Route {
	return r.routes
}
