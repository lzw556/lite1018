package core

import (
	"flag"
	"fmt"
	"github.com/spf13/viper"
	"os"
)

func Viper(path ...string) *viper.Viper {
	var config string
	if len(path) == 0 {
		flag.StringVar(&config, "conf", "", "choose config file.")
		flag.Parse()
		if config == "" {
			if configEnv := os.Getenv("THETA_CLOUD_CONFIG"); configEnv == "" {
				config = "./server/config.yaml"
			} else {
				config = configEnv
			}
		}
	} else {
		config = path[0]
	}
	v := viper.New()
	v.SetConfigFile(config)
	v.SetConfigType("yaml")
	if err := v.ReadInConfig(); err != nil {
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}
	return v
}
