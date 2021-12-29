package vo

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"sort"
)

type ExportDevice struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Address  string `json:"address"`
	Type     uint   `json:"type"`
	Settings string `json:"settings"`
}

type ExportDevices []ExportDevice

func (e ExportDevices) Len() int {
	return len(e)
}

func (e ExportDevices) Less(i, j int) bool {
	return e[i].Type < e[j].Type
}

func (e ExportDevices) Swap(i, j int) {
	e[i], e[j] = e[j], e[i]
}

type NetworkExportFile struct {
	Name         string                 `json:"-"`
	Settings     map[string]interface{} `json:"settings"`
	RoutingTable po.RoutingTables       `json:"routingTable"`
	DeviceList   ExportDevices          `json:"deviceList"`
}

func NewNetworkExportFile(e entity.Network) NetworkExportFile {
	n := NetworkExportFile{
		Name: e.Name,
		Settings: map[string]interface{}{
			"wsn": map[string]interface{}{
				"communication_period":      e.CommunicationPeriod,
				"communication_time_offset": e.CommunicationTimeOffset,
			},
		},
		RoutingTable: e.RoutingTables,
	}
	return n
}

func (n *NetworkExportFile) AddDevices(es []entity.Device) {
	n.DeviceList = make(ExportDevices, len(es))
	for i, e := range es {
		n.DeviceList[i] = ExportDevice{
			ID:      uint(i),
			Name:    e.Name,
			Address: e.MacAddress,
			Type:    e.Type,
		}
		bytes, err := json.Marshal(DeviceSetting{
			IPN:     e.IPN,
			System:  e.System,
			Sensors: e.Sensors,
		})
		if err != nil {
			n.DeviceList[i].Settings = "{}"
		} else {
			n.DeviceList[i].Settings = string(bytes)
		}
	}
	sort.Sort(n.DeviceList)
}

func (n NetworkExportFile) FileName() string {
	return n.Name
}

func (n NetworkExportFile) Write(writer gin.ResponseWriter) error {
	bytes, err := json.Marshal(n)
	if err != nil {
		return err
	}
	_, err = writer.Write(bytes)
	return err
}
