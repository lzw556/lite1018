package config

import (
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
)

func Scan(key string, conf interface{}) error {
	if err := mapstructure.Decode(global.Viper.GetStringMap(key), conf); err != nil {
		return err
	}
	return nil
}
