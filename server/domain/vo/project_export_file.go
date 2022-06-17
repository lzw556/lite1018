package vo

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type AssetExported struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	Type       uint                   `json:"type"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`

	Children         []*AssetExported           `json:"children,omitempty"`
	MonitoringPoints []*MonitoringPointExported `json:"monitoringPoints,omitempty"`
}

type DeviceBinding struct {
	Address    string                 `json:"address"`
	ProcessID  uint                   `json:"processId"`
	Parameters map[string]interface{} `json:"parameters"`
}

type MonitoringPointExported struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Type uint   `json:"type"`

	Attributes map[string]interface{} `json:"attributes,omitempty"`
	Devices    []*DeviceBinding       `json:"devices"`
}

type ProjectExported struct {
	ID       uint                 `json:"id"`
	Name     string               `json:"name"`
	Assets   []*AssetExported     `json:"assets"`
	Networks []*NetworkExportFile `json:"networks"`
}

func (p ProjectExported) FileName() string {
	return fmt.Sprintf("project_%s.json", p.Name)
}

func (p ProjectExported) Write(writer gin.ResponseWriter) error {
	bytes, err := json.Marshal(p)
	if err != nil {
		return err
	}
	_, err = writer.Write(bytes)
	return err
}
