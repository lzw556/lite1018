package core

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Gorm() *gorm.DB {
	var conf config.Database
	if err := config.Scan("database", &conf); err != nil {
		panic(err)
	}
	var db *gorm.DB
	switch conf.Driver {
	case "postgres":
		db = initPostgresSQL(conf)
	case "mysql":
		db = initMySQL(conf)
	case "sqlite":
		db = initSQLite(conf)
	default:
		panic(fmt.Errorf("unknown database driver %s", conf.Driver))
	}
	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.SetConnMaxLifetime(conf.MaxLifetime)
	sqlDB.SetConnMaxIdleTime(conf.MaxIdleTime)
	sqlDB.SetMaxOpenConns(conf.MaxActive)
	sqlDB.SetMaxIdleConns(conf.MaxIdle)
	return db
}

func initPostgresSQL(conf config.Database) *gorm.DB {
	db, err := gorm.Open(postgres.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return db
}

func initMySQL(conf config.Database) *gorm.DB {
	db, err := gorm.Open(mysql.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return db
}

func initSQLite(conf config.Database) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return db
}
