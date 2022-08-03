package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"gorm.io/gorm"
	"time"
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

func (n *Network) SwitchProvisioningMode(mode ProvisioningMode) {
	switch mode {
	case NetworkProvisionMode2:
		n.Mode = NetworkProvisionMode2
		n.Tempo = uint(150 * time.Second.Milliseconds())
		n.GroupInterval = uint(150 * time.Second.Milliseconds())
		n.CallPeriod = uint(150 * time.Second.Milliseconds())
		n.GroupSize = 63
		n.GroupSize2 = 1
	default:
		n.Mode = NetworkProvisionMode1
		n.Tempo = uint(120 * time.Second.Milliseconds())
		n.GroupInterval = uint(120 * time.Second.Milliseconds())
		n.CallPeriod = uint(120 * time.Second.Milliseconds())
		n.CommunicationPeriod2 = 0
		n.GroupSize2 = 1
	}
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
