package sensor

import (
	"bytes"
	"encoding/binary"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Kx122Decoder struct {
}

func NewKx122Decoder() RawDataDecoder {
	return &Kx122Decoder{}
}

func (s Kx122Decoder) Decode(data []byte) (map[string]interface{}, error) {
	// decode metadata
	metadata := [3]SvtMetadata{}
	for i := range metadata {
		m := SvtMetadata{}
		metaByte := data[i*24 : (i+1)*24]
		_ = binary.Read(bytes.NewBuffer(metaByte[:1]), binary.LittleEndian, &m.DataType)
		_ = binary.Read(bytes.NewBuffer(metaByte[1:2]), binary.LittleEndian, &m.Axis)
		_ = binary.Read(bytes.NewBuffer(metaByte[2:3]), binary.LittleEndian, &m.Range)
		_ = binary.Read(bytes.NewBuffer(metaByte[4:8]), binary.LittleEndian, &m.Odr)
		_ = binary.Read(bytes.NewBuffer(metaByte[8:12]), binary.LittleEndian, &m.Number)
		_ = binary.Read(bytes.NewBuffer(metaByte[12:16]), binary.LittleEndian, &m.DataLength)
		if int(m.Axis) < len(metadata) {
			metadata[m.Axis] = m
		}
	}

	// decode raw data
	svtRawData := entity.SvtRawData{}
	rawDataOffset := 88 //metadata length
	for i, m := range metadata {
		axisData := data[rawDataOffset : rawDataOffset+int(m.DataLength)]
		svtRawData.SetMetadata(i, m.Range, m.Odr, m.Number)
		values := make([]float64, 0)
		j := 0
		for j < len(axisData) {
			var value int16
			_ = binary.Read(bytes.NewBuffer(axisData[j:j+2]), binary.LittleEndian, &value)
			values = append(values, float64(value))
			j += 2
		}
		svtRawData.SetValues(i, values)
		rawDataOffset += int(m.DataLength)
	}
	return map[string]interface{}{
		"x": svtRawData.XAxis,
		"y": svtRawData.YAxis,
		"z": svtRawData.ZAxis,
	}, nil
}

type SvtMetadata struct {
	DataType   uint8  `json:"data_type"`
	Axis       uint8  `json:"axis"`
	Range      uint8  `json:"range"`
	Odr        uint32 `json:"odr"`
	Number     uint32 `json:"number"`
	DataLength uint32 `json:"data_length"`
}
