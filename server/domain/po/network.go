package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"gorm.io/gorm"
)

type Network struct {
	gorm.Model
	Name                    string `gorm:"type:varchar(64)"`
	GatewayID               uint
	CommunicationPeriod     uint `gorm:"default:0;not null;"`
	CommunicationTimeOffset uint `gorm:"default:0;not null;"`
	GroupSize               uint `gorm:"default:4;not null;"`
	GroupInterval           uint
	RoutingTables           RoutingTables `gorm:"type:json"`
}

func (Network) TableName() string {
	return "ts_network"
}

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
