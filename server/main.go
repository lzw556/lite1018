package main

import (
	"embed"
	"github.com/thetasensors/theta-cloud-lite/server/app"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/core"
	"github.com/thetasensors/theta-cloud-lite/server/initialize"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/casbin"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
)

//go:embed static
var dist embed.FS

//go:embed rbac_model.conf
var rbacModel string

//go:embed rbac_policy.csv
var rbacPolicy string

func main() {
	//key := "thetasensorskeyaesfitbitsencrypt"
	//if !license.ValidateKeyFile([]byte(key), "license.data") {
	//	fmt.Println("Invalid key file")
	//	return
	//}
	initialize.InitFolder()
	global.Viper = core.Viper()
	dbConf := config.Database{}
	if err := config.Scan("database", &dbConf); err != nil {
		panic(err)
	}
	global.DB = core.InitGorm(dbConf)
	if global.DB != nil {
		if err := initialize.InitTables(global.DB); err != nil {
			panic(err)
		}
	}
	global.BoltDB = core.BoltDB()
	if global.BoltDB != nil {
		initialize.InitBuckets(global.BoltDB)
	}
	casbin.Init(rbacModel, rbacPolicy)
	svrConf := config.Server{}
	if err := config.Scan("server", &svrConf); err != nil {
		panic(err)
	}
	app.Start(svrConf.Mode, dist)
}
