package process

import (
	"errors"
	"fmt"
	"github.com/allegro/bigcache/v3"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/process"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
)

type LargeSensorData struct {
	repository dependency.SensorDataRepository
	mu         sync.RWMutex
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
		var receiver LargeSensorDataReceiver
		err := cache.GetStruct(device.MacAddress, &receiver)
		if errors.Is(bigcache.ErrEntryNotFound, err) {
			receiver = NewLargeSensorDataReceiver(msg.Body.Device, m)
		}
		p.mu.Lock()
		defer p.mu.Unlock()
		xlog.Debugf("[%s] p.receiver.SessionID: %v, pd.SessionId: %v", msg.Body.Device, receiver.SessionID, m.SessionId)
		if receiver.SessionID == m.SessionId {
			if receiver.Receive(m); receiver.IsCompleted() {
				xlog.Infof("[%s] received %d segments", msg.Body.Device, len(receiver.Packets))
				if e, err := receiver.SensorData(); err == nil {
					e.MacAddress = device.MacAddress
					if err := p.repository.Create(e); err != nil {
						return fmt.Errorf("create large sensor data failed: %v", err)
					}

					proc := process.NewProcess()
					if err := proc.ProcessDeviceSensorRawData(device, e); err != nil {
						return fmt.Errorf("Save monitoring point raw data failed: %v", err)
					}
					xlog.Infof("[%s] insert ok large sensor data: %+v", msg.Body.Device, e)
					_ = cache.Delete(device.MacAddress)
				} else {
					return fmt.Errorf("decode large sensor data failed: %v", err)
				}
			}
			xlog.Warnf("[%s] received %d segments not match gave segment num %d", msg.Body.Device, len(receiver.Packets), receiver.NumOfPackets)
		} else {
			receiver.Reset(msg.Body.Device, m)
			receiver.Receive(m)
		}
		if err := cache.SetStruct(device.MacAddress, receiver); err != nil {
			return fmt.Errorf("set cache failed: %v", err)
		}
	}
	return nil
}
