package process

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"sort"
	"time"
)

type LargeSensorData struct {
	repository dependency.LargeSensorDataRepository
}

func NewLargeSensorData() Processor {
	return newRoot(&LargeSensorData{
		repository: repository.LargeSensorData{},
	})
}

func (p LargeSensorData) Name() string {
	return "LargeSensorData"
}

func (p LargeSensorData) Next() Processor {
	return nil
}

func (p LargeSensorData) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.LargeSensorDataMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [LargeSensorData] message failed: %v", err)
	}
	if m.SeqId == 0 {
		temp := SensorDataReceiver{
			Packets: Packets{
				{
					SeqID: m.SeqId,
					Data:  m.Data[m.MetaLength:],
				},
			},
		}
		if err := binary.Read(bytes.NewBuffer(m.Data[4:8]), binary.LittleEndian, &temp.Timestamp); err != nil {
			return err
		}
		if err := binary.Read(bytes.NewBuffer(m.Data[8:12]), binary.LittleEndian, &temp.TotalLength); err != nil {
			return err
		}
		if err := binary.Read(bytes.NewBuffer(m.Data[:4]), binary.LittleEndian, &temp.SensorType); err != nil {
			return err
		}
		if err := cache.SetStruct(msg.Body.Device, &temp); err != nil {
			return err
		}
	} else {
		var receiver SensorDataReceiver
		if err := cache.GetStruct(msg.Body.Device, &receiver); err != nil {
			return err
		}
		receiver.Packets = append(receiver.Packets, Packet{
			SeqID: m.SeqId,
			Data:  m.Data,
		})
		if receiver.isComplete() {
			fmt.Println("total data length:", receiver.TotalLength)
			if value, ok := ctx.Get(msg.Body.Device); ok {
				if device, ok := value.(entity.Device); ok {
					data, err := receiver.sensorData()
					if err != nil {
						return err
					}
					data.MacAddress = msg.Body.Device
					if device.Type == devicetype.VibrationTemperature3AxisType {
						if setting, ok := device.GetSetting("kx122_continuous_odr"); ok {
							data.Parameters[setting.Key] = getKx122ContinuousOdr(cast.ToInt(setting.Value))
						}
						if setting, ok := device.GetSetting("kx122_continuous_range"); ok {
							data.Parameters[setting.Key] = getKx122ContinuousRange(cast.ToInt(setting.Value))
						}
					}
					if err := p.repository.Create(&data); err != nil {
						return err
					}
					_ = cache.Delete(msg.Body.Device)
				}
			}
		} else {
			if err := cache.SetStruct(msg.Body.Device, &receiver); err != nil {
				return err
			}
		}
	}
	return nil
}

type Packet struct {
	SeqID int32  `json:"seq_id"`
	Data  []byte `json:"data"`
}

type Packets []Packet

func (ps Packets) Len() int {
	return len(ps)
}

func (ps Packets) Less(i, j int) bool {
	return ps[i].SeqID < ps[j].SeqID
}

func (ps Packets) Swap(i, j int) {
	ps[i], ps[j] = ps[j], ps[i]
}

type SensorDataReceiver struct {
	Timestamp   uint32  `json:"timestamp"`
	SensorType  uint32  `json:"sensor_type"`
	Packets     Packets `json:"packets"`
	TotalLength uint32  `json:"total_length"`
}

func (t SensorDataReceiver) isComplete() bool {
	var dataLength uint32
	for _, p := range t.Packets {
		dataLength += uint32(len(p.Data))
	}
	return dataLength == t.TotalLength
}

func (t SensorDataReceiver) ReducePackets() []byte {
	bs := make([]byte, 0)
	sort.Sort(t.Packets)
	for _, packet := range t.Packets {
		bs = append(bs, packet.Data...)
	}
	return bs
}

func (t SensorDataReceiver) sensorData() (entity.LargeSensorData, error) {
	data := entity.LargeSensorData{
		SensorType: t.SensorType,
		Time:       time.Unix(int64(t.Timestamp), 0),
		Values:     make([]float64, 0),
		Parameters: map[string]interface{}{},
	}
	byteData := t.ReducePackets()
	for i := 0; i < len(byteData); i += 2 {
		var value int16
		if err := binary.Read(bytes.NewBuffer(byteData[i:i+2]), binary.LittleEndian, &value); err != nil {
			return entity.LargeSensorData{}, err
		}
		data.Values = append(data.Values, float64(value))
	}
	return data, nil
}

func getKx122ContinuousOdr(value int) float32 {
	switch value {
	case 12:
		return 3200
	case 13:
		return 6400
	case 14:
		return 12800
	case 15:
		return 25600
	}
	return 25600
}

func getKx122ContinuousRange(value int) int {
	switch value {
	case 0:
		return 2
	case 1:
		return 4
	case 2:
		return 8
	}
	return 8
}
