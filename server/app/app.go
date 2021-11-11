package app

import (
	"context"
	"embed"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/asset"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/device"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/firmware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/network"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/property"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/system"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/user"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/dispatcher"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/domain/service"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
)

func Start(mode string, dist embed.FS) {
	xlog.Init(mode)
	cache.Init(mode)
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	adapter.RuleEngine = ruleengine.NewAdapter()

	runTask()

	runIoTServer()

	runSocketServer()

	runApiServer(dist)

	<-ctx.Done()

	if adapter.IoT != nil {
		adapter.IoT.Close()
	}
	if adapter.Api != nil {
		adapter.Api.Close()
	}
	if adapter.Socket != nil {
		adapter.Socket.Close()
	}
}

func runTask() {
	task.Init()
	go func() {
		task.Run()
	}()
}

func runIoTServer() {
	conf := config.IoT{}
	if err := config.Scan("iot", &conf); err != nil {
		panic(err)
	}
	adapter.IoT = iot.NewAdapter(conf)
	adapter.IoT.RegisterDispatchers(
		dispatcher.NewDeviceStatus(),
		dispatcher.NewSensorData(),
		dispatcher.NewLinkStatus(),
		dispatcher.NewRestartStatus(),
		dispatcher.NewDeviceInformation(),
		dispatcher.NewBye(),
	)
	if err := adapter.IoT.Run(); err != nil {
		xlog.Error("iot server start failed", err)
		os.Exit(-1)
	}
}

func runApiServer(dist embed.FS) {
	adapter.Api = api.NewAdapter()
	adapter.Api.StaticFS(dist)
	adapter.Api.UseMiddleware(middleware.NewJWT("/login"))
	adapter.Api.RegisterRouters(
		user.NewRouter(service.NewUser()),
		asset.NewRouter(service.NewAsset()),
		device.NewRouter(service.NewDevice()),
		property.NewRouter(service.NewProperty()),
		firmware.NewRouter(service.NewFirmware()),
		network.NewRouter(service.NewNetwork()),
		alarm.NewRouter(service.NewAlarm()),
		system.NewRouter(service.NewSystem()),
	)
	go func() {
		if err := adapter.Api.Run(); err != nil && err != http.ErrServerClosed {
			xlog.Error("api server start failed", err)
			os.Exit(-1)
		}
	}()
	openBrowser(fmt.Sprintf("%s:8290", utils.ReadLocalIPAddress()))
}

func runSocketServer() {
	adapter.Socket = socket.NewAdapter()
	go func() {
		if err := adapter.Socket.Run(); err != nil {
			xlog.Error("socket server start failed", err)
			return
		}
	}()
	xlog.Info("socket server start successful")
}

func openBrowser(url string) {
	if len(url) > 0 {
		name := ""
		switch runtime.GOOS {
		case "darwin":
			name = "open"
		case "windows":
			name = "start"
		}
		if len(name) > 0 {
			cmd := exec.Command(name, fmt.Sprintf("http://%s", url))
			if err := cmd.Start(); err != nil {
				xlog.Infof("open browser failed: %v", err)
			}
		}
	}
}
