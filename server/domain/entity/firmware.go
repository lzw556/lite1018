package entity

import "gorm.io/gorm"

type Firmware struct {
	gorm.Model
	Filename  string `gorm:"type:varchar(256)"`
	ProductID uint
	Major     uint
	Minor     uint
	Version   uint
	Size      uint
	Crc       string `gorm:"type:varchar(16)"`
	Name      string `gorm:"type:varchar(128)"`
	BuildTime uint
}

func (Firmware) TableName() string {
	return "ts_firmware"
}

type Firmwares []Firmware
