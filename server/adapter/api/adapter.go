package api

import (
	"context"
	"embed"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"net/http"
)

//go:embed static
var dist embed.FS

type Adapter struct {
	server      *http.Server
	engine      *gin.Engine
	routers     []router.Router
	middlewares []middleware.Middleware

	port int
}

func NewAdapter(conf config.API) *Adapter {
	a := Adapter{
		engine: gin.New(),
		port:   conf.Port,
	}
	gin.SetMode(conf.Mode)
	return &a
}

func (a *Adapter) RegisterRouters(routers ...router.Router) {
	a.routers = append(a.routers, routers...)
}

func (a *Adapter) UseMiddleware(middlewares ...middleware.Middleware) {
	a.middlewares = append(a.middlewares, middlewares...)
}

func (a *Adapter) enableCors() {

}

func (a *Adapter) Run() error {
	xlog.Infof("api server started on port: %d", a.port)
	a.engine.Use(gin.Recovery())
	a.engine.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
	}))
	a.engine.Use(static.Serve("/", middleware.EmbedFileSystem(dist, "static")))
	group := a.engine.Group("api")
	for _, m := range a.middlewares {
		group.Use(m.WrapHandler())
	}
	for _, r := range a.routers {
		for _, route := range r.Routes() {
			group.Handle(route.Method(), route.Path(), a.errorWrapper(route.Handler()))
		}
	}
	a.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", a.port),
		Handler: a.engine,
	}
	return a.server.ListenAndServe()
}

func (a *Adapter) Close() {
	_ = a.server.Shutdown(context.Background())
	xlog.Info("shutdown api server")
}

func (a *Adapter) errorWrapper(handler middleware.ErrorWrapperHandler) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		data, err := handler(ctx)
		switch err := err.(type) {
		case response.InvalidParameterError:
			response.BadRequest(ctx, err)
		case response.BusinessError:
			response.SuccessWithBusinessError(ctx, err)
		default:
			if err != nil {
				response.SuccessWithBusinessError(ctx, response.UnknownBusinessErr(err))
				return
			}
			switch data := data.(type) {
			case *vo.NetworkExportFile, *vo.PropertyDataFile:
				if writer, ok := data.(response.FileWriter); ok {
					response.WriteFile(ctx, writer)
					return
				}
				response.BadRequest(ctx, response.UnknownBusinessErr(nil))
			default:
				response.Success(ctx, data)
			}
		}
	}
}
