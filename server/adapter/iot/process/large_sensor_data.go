package process

import (
	"errors"
	"fmt"
	"github.com/allegro/bigcache/v3"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
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
		key := fmt.Sprintf("%s-%d", device.MacAddress, m.SessionId)
		err := cache.GetStruct(key, &receiver)
		if errors.Is(bigcache.ErrEntryNotFound, err) {
			receiver = NewLargeSensorDataReceiver(msg.Body.Device, m)
		}
		p.mu.Lock()
		defer p.mu.Unlock()
		if receiver.SessionID == m.SessionId {
			if receiver.Receive(m); receiver.IsCompleted() {
				xlog.Infof("[%s] received %d segments", msg.Body.Device, len(receiver.Packets))
				if e, err := receiver.SensorData(); err == nil {
					e.MacAddress = device.MacAddress
					if err := p.repository.Create(e); err != nil {
						return fmt.Errorf("create large sensor data failed: %v", err)
					}
					xlog.Infof("[%s] insert ok large sensor data: %+v", msg.Body.Device, e)
					_ = cache.Delete(key)
				} else {
					return fmt.Errorf("decode large sensor data failed: %v", err)
				}
			} else {
				xlog.Warnf("[%s] received %d segments not match gave segment num %d", msg.Body.Device, len(receiver.Packets), receiver.NumOfPackets)
			}
		} else {
			xlog.Warnf("[%s] cache session id: %d not match received session id: %d", msg.Body.Device, receiver.SessionID, m.SessionId)
			_ = cache.Delete(key)
			receiver.Reset(msg.Body.Device, m)
			receiver.Receive(m)
		}
		if err := cache.SetStruct(key, receiver); err != nil {
			return fmt.Errorf("set cache failed: %v", err)
		}
		cmd := command.NewLargeSensorDataAckCommand(m.SessionId, m.SegmentId)
		err = cmd.AsyncExecute(msg.Body.Gateway, msg.Body.Device, false)
		if err != nil {
			xlog.Errorf("[%s] send [%s] command failed: %v", msg.Body.Device, cmd.Name(), err)
			return err
		}
	}
	return nil
}
