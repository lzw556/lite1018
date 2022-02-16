package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type FirmwaresQuery struct {
	entity.Firmwares
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
