package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type FirmwaresQuery struct {
	po.Firmwares
}

func NewFirmwaresQuery() FirmwaresQuery {
	return FirmwaresQuery{}
}

func (query FirmwaresQuery) Query() vo.Firmwares {
	result := make(vo.Firmwares, len(query.Firmwares))
	for i, firmware := range query.Firmwares {
		result[i] = vo.NewFirmware(firmware)
	}
	return result
}
