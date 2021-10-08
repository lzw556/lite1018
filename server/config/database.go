package config

import (
	"fmt"
	"time"
)

type Database struct {
	Driver      string
	Host        string
	Port        int
	Username    string
	Password    string
	Name        string
	MaxIdle     int
	MaxIdleTime time.Duration
	MaxActive   int
	MaxLifetime time.Duration
}

func (db Database) DNS() string {
	switch db.Driver {
	case "postgres":
		return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai", db.Host, db.Username, db.Password, db.Name, db.Port)
	case "mysql":
		return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local", db.Username, db.Password, db.Host, db.Port, db.Name)
	case "sqlite":
		return fmt.Sprintf("./data/%s.db", db.Name)
	default:
		panic(fmt.Errorf("unknown database driver %s", db.Driver))
	}
}
