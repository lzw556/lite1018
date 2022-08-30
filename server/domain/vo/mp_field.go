package vo

import "github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"

type MPField struct {
	Name      string `json:"name"`
	Key       string `json:"key"`
	DataIndex int    `json:"dataIndex"`
}

func NewMPField(e monitoringpointtype.Field) MPField {
	return MPField{
		Name:      e.Name,
		Key:       e.Key,
		DataIndex: e.DataIndex,
	}
}

type MPFields []MPField
