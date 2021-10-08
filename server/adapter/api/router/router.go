package router

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"

type Router interface {
	Routes() []Route
}

type Route interface {
	Handler() middleware.ErrorWrapperHandler
	Method() string
	Path() string
}
