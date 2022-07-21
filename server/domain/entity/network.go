package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"gorm.io/gorm"
)

type ProvisioningMode uint8

const (
	NetworkProvisionMode1 ProvisioningMode = iota + 1
	NetworkProvisionMode2
)

type Network struct {
	gorm.Model
	Name                    string `gorm:"type:varchar(64)"`
	ProjectID               uint
	GatewayID               uint
	CommunicationPeriod     uint             `gorm:"default:0;not null;"`
	CommunicationPeriod2    uint             `gorm:"default:0;not null;"`
	CommunicationTimeOffset uint             `gorm:"default:0;not null;"`
	GroupSize               uint             `gorm:"default:4;not null;"`
	GroupSize2              uint             `gorm:"default:1;not null;"`
	GroupInterval           uint             `gorm:"default:120000;not null;"`
	Tempo                   uint             `gorm:"default:120000;not null;"`
	CallPeriod              uint             `gorm:"default:120000;not null;"`
	Mode                    ProvisioningMode `gorm:"default:1;not null;"`
	Gateway                 Device           `gorm:"-"`
}

func (Network) TableName() string {
	return "ts_network"
}

type Networks []Network

type RoutingTable [2]string
type RoutingTables []RoutingTable

func (s RoutingTables) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *RoutingTables) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal RoutingTables value:", v))
	}
	return json.Unmarshal(bytes, s)
}
