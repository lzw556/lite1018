package core

import (
	"flag"
	"fmt"
	"github.com/spf13/viper"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"os"
)

func Viper(path ...string) *viper.Viper {
	var conf string
	if len(path) == 0 {
		flag.StringVar(&conf, "conf", "", "choose conf file.")
		flag.Parse()
		if conf == "" {
			if configEnv := os.Getenv("THETA_CLOUD_CONFIG"); configEnv == "" {
				conf = "./config.yaml"
			} else {
				conf = configEnv
			}
		}
	} else {
		conf = path[0]
	}
	v := viper.New()
	v.SetConfigFile(conf)
	v.SetConfigType("yaml")
	_, err := os.Stat(conf)
	if os.IsNotExist(err) {
		initializeConfig()
	}
	if err := v.ReadInConfig(); err != nil {
		panic(err)
	}
	return v
}

func initializeConfig() {
	v := viper.New()
	apiConf := config.API{Port: 8080}
	socketConf := config.Socket{Port: 8081}
	iotConf := config.IoT{Username: "admin", Password: "123456", Broker: "127.0.0.1:1883"}
	iotConf.Server.Enabled = true
	iotConf.Server.Port = 1883
	dbConf := config.Database{Driver: "sqlite", Name: "theta_cloud", MaxIdleTime: 60, MaxLifetime: 60, MaxIdle: 10, MaxActive: 10}
	v.Set("api", apiConf)
	v.Set("socket", socketConf)
	v.Set("iot", iotConf)
	v.Set("database", dbConf)
	if err := v.WriteConfigAs("config.yaml"); err != nil {
		fmt.Println(fmt.Errorf("init config file failed: %v", err))
	}
}
