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
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/user"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/dispatcher"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/domain/service"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"net"
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

	select {
	case <-ctx.Done():
		if adapter.IoT != nil {
			adapter.IoT.Close()
		}
		if adapter.Api != nil {
			adapter.Api.Close()
		}
		if adapter.Socket != nil {
			adapter.Socket.Close()
		}
		return
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
		return
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
	var conf config.API
	if err := config.Scan("api", &conf); err != nil {
		panic(err)
	}
	adapter.Api = api.NewAdapter(conf)
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
	)
	go func() {
		if err := adapter.Api.Run(); err != nil {
			xlog.Error("api server start failed", err)
			os.Exit(-1)
		}
	}()
	openBrowser(fmt.Sprintf("%s:%d", readLocalIPAddress(), conf.Port))
}

func runSocketServer() {
	var conf config.Socket
	if err := config.Scan("socket", &conf); err != nil {
		panic(err)
	}
	adapter.Socket = socket.NewAdapter(conf)
	go func() {
		if err := adapter.Socket.Run(); err != nil {
			xlog.Error("socket server start failed", err)
			return
		}
	}()
	xlog.Info("socket server start successful")
}

func readLocalIPAddress() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
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
