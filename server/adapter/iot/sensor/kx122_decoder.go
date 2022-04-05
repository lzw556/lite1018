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
	metadata := [3]svtMetadata{}
	for i := range metadata {
		m := svtMetadata{}
		metaByte := data[i*24 : (i+1)*24]
		_ = binary.Read(bytes.NewBuffer(metaByte[:1]), binary.LittleEndian, &m.dataType)
		_ = binary.Read(bytes.NewBuffer(metaByte[1:2]), binary.LittleEndian, &m.axis)
		_ = binary.Read(bytes.NewBuffer(metaByte[2:3]), binary.LittleEndian, &m.ranges)
		_ = binary.Read(bytes.NewBuffer(metaByte[4:8]), binary.LittleEndian, &m.odr)
		_ = binary.Read(bytes.NewBuffer(metaByte[8:12]), binary.LittleEndian, &m.number)
		_ = binary.Read(bytes.NewBuffer(metaByte[12:16]), binary.LittleEndian, &m.dataLength)
		if int(m.axis) < len(metadata) {
			metadata[m.axis] = m
		}
	}

	// decode raw data
	svtRawData := entity.SvtRawData{}
	rawDataOffset := 88 //metadata length
	for i, m := range metadata {
		axisData := data[rawDataOffset : rawDataOffset+int(m.dataLength)]
		svtRawData.SetMetadata(i, m.ranges, m.odr, m.number)
		values := make([]float64, 0)
		j := 0
		for j < len(axisData) {
			var value int16
			_ = binary.Read(bytes.NewBuffer(axisData[j:j+2]), binary.LittleEndian, &value)
			values = append(values, float64(value))
			j += 2
		}
		svtRawData.SetValues(i, values)
		rawDataOffset += int(m.dataLength)
	}
	return map[string]interface{}{
		"x": svtRawData.XAxis,
		"y": svtRawData.YAxis,
		"z": svtRawData.ZAxis,
	}, nil
}

type svtMetadata struct {
	dataType   uint8
	axis       uint8
	ranges     uint8
	odr        uint32
	number     uint32
	dataLength uint32
}
