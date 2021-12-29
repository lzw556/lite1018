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
		router.NewPostRoute("alarmTemplates", r.createTemplate),
		router.NewPostRoute("alarms", r.create),

		// GET
		router.NewGetRoute("alarmTemplates", r.pagingTemplates),
		router.NewGetRoute("alarmTemplates/:id", r.getTemplate),
		router.NewGetRoute("alarms", r.find),
		router.NewGetRoute("alarms/:id", r.get),
		router.NewGetRoute("alarmRecords", r.pagingRecords),
		router.NewGetRoute("alarmRecords/:id", r.getRecord),
		router.NewGetRoute("alarmRecords/:id/acknowledge", r.getRecordAcknowledge),
		router.NewGetRoute("alarmRecords/statistics", r.alarmRecordStatistical),

		router.NewGetRoute("check/alarms/:name", r.checkAlarm),

		// PUT
		router.NewPutRoute("alarmTemplates/:id", r.updateTemplate),
		router.NewPutRoute("alarms/:id", r.update),

		// PATCH
		router.NewPatchRoute("alarmRecords/:id/acknowledge", r.acknowledgeRecord),

		// DELETE
		router.NewDeleteRoute("alarmTemplates/:id", r.removeTemplate),
		router.NewDeleteRoute("alarms/:id", r.remove),
		router.NewDeleteRoute("alarmRecords/:id", r.removeRecord),
	}
}

func (r *alarmRouter) Routes() []router.Route {
	return r.routes
}
