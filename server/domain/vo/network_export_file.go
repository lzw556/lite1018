package vo

import (
	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type ExportDevice struct {
	ID            uint                              `json:"id"`
	Name          string                            `json:"name"`
	Address       string                            `json:"address"`
	ParentAddress string                            `json:"parentAddress"`
	Type          uint                              `json:"type"`
	Settings      map[string]map[string]interface{} `json:"settings"`
	Modbus        int                               `json:"modbus"`
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
	Name       string                 `json:"-"`
	Wsn        map[string]interface{} `json:"wsn"`
	DeviceList ExportDevices          `json:"deviceList"`
}

func NewNetworkExportFile(e entity.Network) NetworkExportFile {
	n := NetworkExportFile{
		Name: e.Name,
		Wsn: map[string]interface{}{
			"communication_period": e.CommunicationPeriod,
			"communication_offset": e.CommunicationTimeOffset,
			"group_interval":       e.GroupInterval,
			"group_size":           e.GroupSize,
		},
	}
	return n
}

func (n *NetworkExportFile) AddDevices(es []entity.Device) {
	n.DeviceList = make(ExportDevices, len(es))
	for i, e := range es {
		n.DeviceList[i] = ExportDevice{
			ID:            uint(i),
			Name:          e.Name,
			Address:       e.MacAddress,
			ParentAddress: e.Parent,
			Modbus:        0,
			Type:          e.Type,
		}
		settings := map[string]map[string]interface{}{}
		for _, setting := range e.Settings {
			if _, ok := settings[setting.Category]; ok {
				settings[setting.Category][setting.Key] = setting.Value
			} else {
				settings[setting.Category] = map[string]interface{}{
					setting.Key: setting.Value,
				}
			}
		}
		n.DeviceList[i].Settings = settings
	}
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
