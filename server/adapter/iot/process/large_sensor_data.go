package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/sensor"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"sync"
	"time"
)

type LargeSensorData struct {
	repository dependency.SensorDataRepository

	mu sync.RWMutex
}

func NewLargeSensorData() Processor {
	return newRoot(&LargeSensorData{
		repository: repository.SensorData{},
		mu:         sync.RWMutex{},
	})
}

func (p *LargeSensorData) Name() string {
	return "LargeSensorData"
}

func (p *LargeSensorData) Next() Processor {
	return nil
}

func (p *LargeSensorData) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		device := value.(entity.Device)
		m := pd.LargeSensorDataMessage{}
		if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
			return fmt.Errorf("unmarshal [LargeSensorData] message failed: %v", err)
		}
		if m.SeqId == 0 {
			receiver := NewLargeSensorDataReceiver(m)
			if err := cache.SetStruct(device.MacAddress, receiver); err != nil {
				return fmt.Errorf("set cache failed: %v", err)
			}
		} else {
			p.mu.Lock()
			defer p.mu.Unlock()
			var receiver LargeSensorDataReceiver
			if err := cache.GetStruct(device.MacAddress, &receiver); err != nil {
				return fmt.Errorf("get cache failed: %v", err)
			}
			if receiver.Receive(m.SeqId, m.Data); receiver.IsCompleted() {
				e := entity.SensorData{
					Time:       time.UnixMilli(int64(receiver.Timestamp)),
					SensorType: uint(receiver.SensorType),
					MacAddress: device.MacAddress,
				}
				var decoder sensor.RawDataDecoder
				switch receiver.SensorType {
				case devicetype.KxSensor:
					decoder = sensor.NewKx122Decoder()
				}
				if data, err := decoder.Decode(receiver.Bytes()); err == nil {
					e.Values = data
					if err := p.repository.Create(e); err != nil {
						return fmt.Errorf("create large sensor data failed: %v", err)
					}
				} else {
					return fmt.Errorf("decode large sensor data failed: %v", err)
				}
			} else {
				if err := cache.SetStruct(device.MacAddress, receiver); err != nil {
					return fmt.Errorf("set cache failed: %v", err)
				}
			}
		}
	}
	return nil
}
