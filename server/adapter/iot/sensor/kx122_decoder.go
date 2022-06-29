package sensor

import (
	"encoding/binary"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Kx122Decoder struct{}

func NewKx122Decoder() RawDataDecoder {
	return &Kx122Decoder{}
}

func (s Kx122Decoder) Decode(data []byte) (map[string]interface{}, error) {
	// decode metadata
	metadata := [3]struct {
		dataType   uint8
		axis       uint8
		ranges     uint8
		odr        uint32
		number     uint32
		dataLength uint32
	}{}
	metadataBytes := data[:72]
	for i := 0; i < len(metadataBytes); i += 24 {
		axis := metadataBytes[i+1]
		metadata[axis].dataType = metadataBytes[i]
		metadata[axis].ranges = metadataBytes[i+2]
		metadata[axis].odr = binary.LittleEndian.Uint32(metadataBytes[i+4 : i+8])
		metadata[axis].number = binary.LittleEndian.Uint32(metadataBytes[i+8 : i+12])
		metadata[axis].dataLength = binary.LittleEndian.Uint32(metadataBytes[i+12 : i+16])
	}

	// decode raw data
	totalLength := int(metadata[0].dataLength + metadata[1].dataLength + metadata[2].dataLength)
	valueBytes := data[72:]
	if len(valueBytes) == totalLength {
		svtRawData := entity.SvtRawData{}
		rawDataOffset := 0 //metadata length
		for i, m := range metadata {
			axisData := valueBytes[rawDataOffset : rawDataOffset+int(m.dataLength)]
			svtRawData.SetMetadata(i, m.ranges, m.odr, m.number)
			switch m.dataType {
			case 3: // int16
				svtRawData.SetValues(i, decodeInt16(axisData))
			case 6: // uint24
				svtRawData.SetValues(i, decodeUint24(axisData))
			}
			rawDataOffset += int(m.dataLength)
		}
		d := map[string]interface{}{}
		if err := mapstructure.Decode(svtRawData, &d); err != nil {
			return nil, err
		}
		return d, nil
	}
	return nil, fmt.Errorf("invalid data length data length = %d, receive length = %d", totalLength, len(valueBytes))
}

func decodeInt16(data []byte) []float64 {
	j := 0
	values := make([]float64, 0)
	for j < len(data) {
		var value = int16(binary.LittleEndian.Uint16(data[j : j+2]))
		values = append(values, float64(value))
		j += 2
	}
	return values
}

func decodeUint24(data []byte) []float64 {
	j := 0
	values := make([]float64, 0)
	for j < len(data) {
		var value = binary.LittleEndian.Uint32(append(data[j:j+3], 0))
		values = append(values, float64(value))
		j += 3
	}
	return values
}
