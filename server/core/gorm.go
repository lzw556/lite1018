package core

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/config"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/global"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"time"
)

func InitGorm(conf config.Database) {
	var db *gorm.DB
	var err error
	switch conf.Driver {
	case "postgres":
		db, err = initPostgresSQL(conf)
	case "mysql":
		db, err = initMySQL(conf)
	case "sqlite":
		db, err = initSQLite(conf)
	default:
		panic(fmt.Errorf("unknown database driver %s", conf.Driver))
	}
	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}
	if err := sqlDB.Ping(); err != nil {
		panic(err)
	}
	sqlDB.SetConnMaxLifetime(time.Duration(conf.MaxLifetime) * time.Second)
	sqlDB.SetConnMaxIdleTime(time.Duration(conf.MaxIdleTime) * time.Second)
	sqlDB.SetMaxOpenConns(conf.MaxActive)
	sqlDB.SetMaxIdleConns(conf.MaxIdle)
	global.DB = db
}

func initPostgresSQL(conf config.Database) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

func initMySQL(conf config.Database) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

func initSQLite(conf config.Database) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(conf.DNS()), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}
