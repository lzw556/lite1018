package core

import (
	"flag"
	"fmt"
	"os"

	"github.com/spf13/viper"
	"github.com/thetasensors/theta-cloud-lite/server/config"
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
	iotConf := config.IoT{Username: "admin", Password: "123456", Broker: "127.0.0.1:1883"}
	iotConf.Server.Enabled = true
	iotConf.Server.Port = 1883
	dbConf := config.Database{Driver: "sqlite", Name: "cloud", MaxIdleTime: 60, MaxLifetime: 60, MaxIdle: 10, MaxActive: 10}
	svrConf := config.Server{Mode: "debug"}
	v.Set("iot", iotConf)
	v.Set("database", dbConf)
	v.Set("server", svrConf)
	if err := v.WriteConfigAs("config.yaml"); err != nil {
		fmt.Println(fmt.Errorf("init config file failed: %v", err))
	}
}
