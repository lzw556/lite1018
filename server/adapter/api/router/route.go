package router

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"
	"net/http"
)

type route struct {
	method  string
	path    string
	handler middleware.ErrorWrapperHandler
}

func NewRoute(method string, path string, handler middleware.ErrorWrapperHandler) Route {
	return route{
		method:  method,
		path:    path,
		handler: handler,
	}
}

func (r route) Handler() middleware.ErrorWrapperHandler {
	return r.handler
}

func (r route) Method() string {
	return r.method
}

func (r route) Path() string {
	return r.path
}

func NewGetRoute(path string, handler middleware.ErrorWrapperHandler) Route {
	return NewRoute(http.MethodGet, path, handler)
}

func NewPostRoute(path string, handler middleware.ErrorWrapperHandler) Route {
	return NewRoute(http.MethodPost, path, handler)
}

func NewPutRoute(path string, handler middleware.ErrorWrapperHandler) Route {
	return NewRoute(http.MethodPut, path, handler)
}

func NewDeleteRoute(path string, handler middleware.ErrorWrapperHandler) Route {
	return NewRoute(http.MethodDelete, path, handler)
}

func NewPatchRoute(path string, handler middleware.ErrorWrapperHandler) Route {
	return NewRoute(http.MethodPatch, path, handler)
}
