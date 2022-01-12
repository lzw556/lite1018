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
		router.NewPostRoute("alarms", r.createAlarm),

		// GET
		router.NewGetRoute("alarmTemplates", r.findTemplates),
		router.NewGetRoute("alarmTemplates/:id", r.getTemplate),
		router.NewGetRoute("alarms", r.findAlarms),
		router.NewGetRoute("alarms/:id", r.getAlarms),
		router.NewGetRoute("alarmRecords", r.findRecords),
		router.NewGetRoute("alarmRecords/:id", r.getRecord),
		router.NewGetRoute("alarmRecords/:id/acknowledge", r.getRecordAcknowledge),

		router.NewGetRoute("check/alarms/:name", r.checkAlarm),

		// PUT
		router.NewPutRoute("alarmTemplates/:id", r.updateTemplate),
		router.NewPutRoute("alarms/:id", r.updateAlarm),

		// PATCH
		router.NewPatchRoute("alarmRecords/:id/acknowledge", r.acknowledgeRecord),

		// DELETE
		router.NewDeleteRoute("alarmTemplates/:id", r.deleteTemplate),
		router.NewDeleteRoute("alarms/:id", r.deleteAlarm),
		router.NewDeleteRoute("alarmRecords/:id", r.deleteRecord),
	}
}

func (r *alarmRouter) Routes() []router.Route {
	return r.routes
}
