package main

import (
	"context"
	"fmt"
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
	"github.com/thetasensors/theta-cloud-lite/server/adapter/mqtt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/core"
	"github.com/thetasensors/theta-cloud-lite/server/domain/service"
	"github.com/thetasensors/theta-cloud-lite/server/initialize"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
	"time"
)

func main() {
	go func() {
		task.Run()
	}()

	mqttServer := initMQTTServer()
	if mqttServer != nil {
		if err := mqttServer.Run(); err != nil {
			xlog.Error("mqtt server start failed", err)
			os.Exit(-1)
		}
	}

	iotServer := initIoTServer()
	if err := iotServer.Run(); err != nil {
		xlog.Error("iot server start failed", err)
		os.Exit(-1)
	}

	socketServer := initSocketServer()
	go func() {
		if err := socketServer.Run(); err != nil {
			xlog.Error("socket server start failed", err)
			return
		}
	}()
	xlog.Info("socket server start successful")

	apiServer, address := initApiServer()
	go func() {
		if err := apiServer.Run(); err != nil {
			xlog.Error("api server start failed", err)
			os.Exit(-1)
		}
	}()

	openBrowser(address)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
	select {
	case <-ctx.Done():
		stop()
		if mqttServer != nil {
			mqttServer.Close()
		}
		iotServer.Close()
		time.Sleep(time.Second)
		return
	}

}

func init() {
	global.Viper = core.Viper()
	global.DB = core.Gorm()
	if global.DB != nil {
		initialize.InitTables(global.DB)
	}
	global.BoltDB = core.BoltDB()
	if global.BoltDB != nil {
		initialize.InitBuckets(global.BoltDB)
	}
	xlog.Init("release")
	cache.Init("debug")
	task.Init()
	ruleengine.Init()
}

func initMQTTServer() *mqtt.Adapter {
	var conf config.MQTT
	if err := config.Scan("mqtt", &conf); err != nil {
		panic(err)
	}
	if conf.Server.Enabled {
		xlog.Infof("internal mqtt server is enabled on port: %d", conf.Server.Port)
		mqttServer := mqtt.NewAdapter(conf)
		return &mqttServer
	}
	xlog.Info("internal mqtt server is disabled, please provide a external mqtt server")
	return nil
}

func initIoTServer() *iot.Adapter {
	var conf config.MQTT
	if err := config.Scan("mqtt", &conf); err != nil {
		panic(err)
	}
	iotServer := iot.NewAdapter(conf)
	iotServer.RegisterDispatchers(
		dispatcher.NewDeviceStatus(),
		dispatcher.NewSensorData(),
		dispatcher.NewLinkStatus(),
		dispatcher.NewRebootResponse(),
		dispatcher.NewResetResponse(),
		dispatcher.NewUpdateDeviceSettingsResponse(),
		dispatcher.NewUpdateWsnSettingsResponse(),
		dispatcher.NewUpdateDeviceListResponse(),
		dispatcher.NewRestartStatus(),
		dispatcher.NewDeviceInformation(),
		dispatcher.NewEvent(),
	)
	return &iotServer
}

func initApiServer() (*api.Adapter, string) {
	var conf config.API
	if err := config.Scan("api", &conf); err != nil {
		panic(err)
	}
	apiServer := api.NewAdapter(conf)
	apiServer.UseMiddleware(middleware.NewJWT("/login"))
	apiServer.RegisterRouters(
		user.NewRouter(service.NewUser()),
		asset.NewRouter(service.NewAsset()),
		device.NewRouter(service.NewDevice()),
		property.NewRouter(service.NewProperty()),
		firmware.NewRouter(service.NewFirmware()),
		network.NewRouter(service.NewNetwork()),
		alarm.NewRouter(service.NewAlarm()),
	)
	if conf.Mode == "release" {
		return apiServer, fmt.Sprintf("%s:%d/#/", readLocalIPAddress(), conf.Port)
	}
	return apiServer, ""
}

func initSocketServer() *socket.Adapter {
	var conf config.Socket
	if err := config.Scan("socket", &conf); err != nil {
		panic(err)
	}
	socketServer := socket.NewAdapter(conf)
	return socketServer
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
