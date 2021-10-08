package vo

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type Firmware struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Crc       string `json:"crc"`
	Version   string `json:"version"`
	ProductID uint   `json:"productId"`
	BuildTime int64  `json:"buildTime"`
}

func NewFirmware(e po.Firmware) Firmware {
	return Firmware{
		ID:        e.ID,
		Name:      e.Name,
		Crc:       e.Crc,
		Version:   fmt.Sprintf("%d.%d.%d", e.Major, e.Minor, e.Version),
		ProductID: e.ProductID,
		BuildTime: int64(e.BuildTime),
	}
}

type Firmwares []Firmware
