package app

import (
	"context"
	"embed"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/adapter"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/middleware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/alarm"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/device"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/firmware"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/menu"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/network"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/permission"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/project"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/property"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/role"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/statistic"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/system"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/user"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/crontask"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/dispatcher"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/domain/service"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/thetasensors/theta-cloud-lite/server/worker"
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
	ruleengine.Init()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	runTask()

	conf := config.IoT{}
	if err := config.Scan("iot", &conf); err != nil {
		panic(err)
	}

	runIoTServer(conf)

	runSocketServer()

	runApiServer(mode, dist)

	go worker.Run()

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
	adapter.CronTask = crontask.NewAdapter()
	go func() {
		adapter.CronTask.Run()
	}()
}

func runIoTServer(conf config.IoT) {
	adapter.IoT = iot.NewAdapter(conf)
	adapter.IoT.RegisterDispatchers(
		dispatcher.NewDeviceStatus(),
		dispatcher.NewLinkStatus(),
		dispatcher.NewLinkStates(),
		dispatcher.NewRestartStatus(),
		dispatcher.NewSensorData(),
		dispatcher.NewLargeSensorData(),
		dispatcher.NewDeviceInformation(),
		dispatcher.NewPing(),
		dispatcher.NewHello(),
		dispatcher.NewBye(),
		dispatcher.NewEvent(),
		dispatcher.NewCalibrationStatus(),
		dispatcher.NewPullFirmware(),
		dispatcher.NewFirmwareUpgradeStatus(),
		command.NewAddDeviceResponse(),
		command.NewCalibrateResponse(),
		command.NewCancelFirmwareResponse(),
		command.NewClearDevicesResponse(),
		command.NewDeleteDeviceResponse(),
		command.NewGetDeviceSettingsResponse(),
		command.NewGetLinkStatesResponse(),
		command.NewGetWsnResponse(),
		command.NewLoadFirmwareResponse(),
		command.NewProvisionResponse(),
		command.NewRebootResponse(),
		command.NewResetResponse(),
		command.NewResetDataResponse(),
		command.NewUpdateDeviceSettingsResponse(),
		command.NewUpdateDeviceResponse(),
		command.NewUpdateDevicesResponse(),
		command.NewUpdateWsnResponse(),
		command.NewUpgradeFirmwareResponse(),
	)
	if err := adapter.IoT.Run(); err != nil {
		xlog.Error("iot server start failed", err)
		os.Exit(-1)
	}
}

func runApiServer(mode string, dist embed.FS) {
	switch mode {
	case "debug":
		gin.SetMode(gin.DebugMode)
	default:
		gin.SetMode(gin.ReleaseMode)
	}

	adapter.Api = api.NewAdapter()
	adapter.Api.Socket(adapter.Socket.Server())
	adapter.Api.StaticFS(dist)
	adapter.Api.UseMiddleware(
		middleware.NewJWT("/login", "/resources/*"),
		middleware.NewCasbinRbac("/login", "/my/*", "/check/*", "/menus/*", "/permissions/*", "/resources/*", "/statistics/*", "/devices/defaultSettings", "/properties"),
		middleware.NewProjectChecker("/login", "/resources/*", "/users/*", "/my/*"),
	)
	adapter.Api.RegisterRouters(
		project.NewRouter(service.NewProject()),
		user.NewRouter(service.NewUser()),
		menu.NewRouter(service.NewMenu()),
		role.NewRouter(service.NewRole()),
		permission.NewRouter(service.NewPermission()),
		device.NewRouter(service.NewDevice()),
		property.NewRouter(service.NewProperty()),
		alarm.NewRouter(service.NewAlarm()),
		firmware.NewRouter(service.NewFirmware()),
		network.NewRouter(service.NewNetwork()),
		system.NewRouter(service.NewSystem()),
		statistic.NewRouter(service.NewStatistic()),
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
