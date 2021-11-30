package user

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"

type userRouter struct {
	service Service
	routes  []router.Route
}

func NewRouter(s Service) router.Router {
	r := userRouter{
		service: s,
	}
	r.initRoutes()
	return &r
}

func (r *userRouter) initRoutes() {
	r.routes = []router.Route{
		// POST
		router.NewPostRoute("login", r.login),
		router.NewPostRoute("users", r.create),

		// GET
		router.NewGetRoute("users", r.paging),
		router.NewGetRoute("users/:id", r.getByID),
		router.NewGetRoute("my/profile", r.profile),

		// PUT
		router.NewPutRoute("users/:id", r.updateByID),

		// PATCH
		router.NewPatchRoute("my/profile", r.updateProfile),
		router.NewPatchRoute("my/pass", r.updatePass),

		// DELETE
		router.NewDeleteRoute("users/:id", r.removeByID),
	}
}

func (r *userRouter) Routes() []router.Route {
	return r.routes
}
