package api

import (
	"context"
	"embed"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"golang.org/x/sync/errgroup"
	"net/http"
)

type Adapter struct {
	engine      *gin.Engine
	routers     []router.Router
	middlewares []middleware.Middleware
	server      *http.Server
}

func NewAdapter() *Adapter {
	a := Adapter{
		engine: gin.New(),
		server: &http.Server{
			Addr: ":8290",
		},
	}
	return &a
}

func (a *Adapter) RegisterRouters(routers ...router.Router) {
	a.routers = append(a.routers, routers...)
}

func (a *Adapter) StaticFS(dist embed.FS) {
	a.engine.Use(static.Serve("/", middleware.EmbedFileSystem(dist, "static")))
}

func (a *Adapter) UseMiddleware(middlewares ...middleware.Middleware) {
	a.middlewares = append(a.middlewares, middlewares...)
}

func (a Adapter) Socket(server *socketio.Server) {
	a.engine.GET("/socket.io/*any", gin.WrapH(server))
	a.engine.POST("/socket.io/*any", gin.WrapH(server))
}

func (a *Adapter) Run() error {
	xlog.Info("api server started on port 8290")
	a.engine.Use(gin.Recovery())
	a.engine.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
	}))
	a.engine.Static("/res", "/resources")
	group := a.engine.Group("api")
	for _, m := range a.middlewares {
		group.Use(m.WrapHandler())
	}
	group.Use(gzip.Gzip(gzip.DefaultCompression))
	for _, r := range a.routers {
		for _, route := range r.Routes() {
			group.Handle(route.Method(), route.Path(), a.errorWrapper(route.Handler()))
		}
	}
	a.server.Handler = a.engine
	var eg errgroup.Group
	eg.Go(func() error {
		return a.server.ListenAndServe()
	})
	return eg.Wait()
}

func (a *Adapter) Close() {
	xlog.Info("shutdown api server")
	if err := a.server.Shutdown(context.Background()); err != nil {
		xlog.Error("shutdown api server error", err)
	}
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
			case *vo.NetworkExportFile, *vo.ExcelFile, *vo.ImageFile, *vo.CsvFile:
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
