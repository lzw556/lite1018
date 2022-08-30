package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/process"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
	"time"
)

type SensorData struct {
	deviceRepo      dependency.DeviceRepository
	sensorDataRepo  dependency.SensorDataRepository
	alarmSourceRepo dependency.AlarmSourceRepository
	alarmRuleRepo   dependency.AlarmRuleRepository
	processor       Processor

	mu sync.RWMutex
}

func NewSensorData() Processor {
	return newRoot(&SensorData{
		deviceRepo:      repository.Device{},
		sensorDataRepo:  repository.SensorData{},
		alarmSourceRepo: repository.AlarmSource{},
		alarmRuleRepo:   repository.AlarmRule{},
		mu:              sync.RWMutex{},
	})
}

func (p *SensorData) Name() string {
	return "SensorData"
}

func (p *SensorData) Next() Processor {
	return p.processor
}

func (p *SensorData) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.SensorDataMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [SensorData] message failed: %v", err)
	}
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			e := entity.SensorData{
				Time:       time.Unix(int64(m.Timestamp), int64(m.Usec*1000)),
				MacAddress: device.MacAddress,
				SensorType: uint(m.SensorId),
			}
			xlog.Debugf("received sensor data: %+v", e)
			if t := devicetype.Get(device.Type); t != nil {
				p.mu.Lock()
				defer p.mu.Unlock()
				e.Values = map[string]interface{}{}
				for _, property := range t.Properties(e.SensorType) {
					for _, field := range property.Fields {
						if len(m.Values) > field.DataIndex {
							e.Values[field.Key] = m.Values[field.DataIndex]
						}
					}
				}

				if err := p.sensorDataRepo.Create(e); err != nil {
					return fmt.Errorf("save device %s data failed: %v", device.MacAddress, err)
				}
				if sources, err := p.alarmSourceRepo.FindBySpecs(context.TODO(), spec.SourceEqSpec(device.ID)); err == nil {
					ids := make([]uint, len(sources))
					for i, source := range sources {
						ids[i] = source.AlarmRuleID
					}
					if alarmRules, err := p.alarmRuleRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(ids)); err == nil {
						ruleengine.ExecuteSelectedRules(device.ID, alarmRules...)
					}
				}

				proc := process.NewProcess()
				if err := proc.ProcessDeviceSensorData(device, e); err != nil {
					return fmt.Errorf("Save monitoring point data failed: %v", err)
				}
			}
		}
	}
	cmd := command.NewSensorDataAckCmd(m.SessionId, m.SensorId)
	if err := cmd.ExecuteAsync(msg.Body.Gateway, msg.Body.Device, false); err != nil {
		xlog.Errorf("[%s] send [%s] command failed: %v", msg.Body.Device, cmd.Name(), err)
		return err
	}
	return nil
}
