package entity

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
	ProjectID               uint
	GatewayID               uint
	CommunicationPeriod     uint `gorm:"default:0;not null;"`
	CommunicationTimeOffset uint `gorm:"default:0;not null;"`
	GroupSize               uint `gorm:"default:4;not null;"`
	GroupInterval           uint
	RoutingTables           RoutingTables `gorm:"type:json"`

	Gateway Device `gorm:"-"`
}

func (Network) TableName() string {
	return "ts_network"
}

func (n *Network) AddDevices(parent Device, children ...Device) {
	tables := make(RoutingTables, len(children))
	for i, child := range children {
		tables[i] = RoutingTable{
			child.MacAddress,
			parent.MacAddress,
		}
	}
	n.RoutingTables = append(n.RoutingTables, tables...)
}

func (n *Network) RemoveDevice(e Device) {
	if len(n.RoutingTables) > 0 {
		parent := RoutingTable{}
		rmIdx := 0
		for i, table := range n.RoutingTables {
			if table[0] == e.MacAddress {
				rmIdx = i
				parent = table
			}
		}
		for i, table := range n.RoutingTables {
			if table[1] == e.MacAddress {
				n.RoutingTables[i][1] = parent[1]
			}
		}
		n.RoutingTables = append(n.RoutingTables[:rmIdx], n.RoutingTables[rmIdx+1:]...)
	}
}

func (n Network) GetChildrenMac(parent string) []string {
	macs := make([]string, 0)
	for _, table := range n.RoutingTables {
		if table[1] == parent {
			macs = append(macs, table[0])
		}
	}
	return macs
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
