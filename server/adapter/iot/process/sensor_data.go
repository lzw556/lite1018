package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"sync"
	"time"
)

var mu sync.RWMutex

type SensorData struct {
	deviceRepo     dependency.DeviceRepository
	deviceDataRepo dependency.DeviceDataRepository
	alarmRuleRepo  dependency.AlarmRuleRepository
	propertyRepo   dependency.PropertyRepository
}

func NewSensorData() Processor {
	return newRoot(SensorData{
		deviceRepo:     repository.Device{},
		deviceDataRepo: repository.DeviceData{},
		alarmRuleRepo:  repository.AlarmRule{},
		propertyRepo:   repository.Property{},
	})
}

func (p SensorData) Name() string {
	return "SensorData"
}

func (p SensorData) Next() Processor {
	return nil
}

func (p SensorData) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.SensorDataMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [SensorData] message failed: %v", err)
	}
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			e := po.DeviceData{
				Time:       time.Unix(int64(m.Timestamp), int64(m.Usec*1000)),
				DeviceID:   device.ID,
				SensorType: uint(m.SensorId),
				Values:     m.GetValues(),
			}
			mu.Lock()
			defer mu.Unlock()
			if err := p.deviceDataRepo.Create(e); err != nil {
				return fmt.Errorf("save device %s data failed: %v", device.MacAddress, err)
			}
			rules, err := p.alarmRuleRepo.FindBySpecs(context.TODO(), spec.DevicesSpec{device.ID})
			if err != nil {
				return fmt.Errorf("find device %s alarm rules faield: %v", device.MacAddress, err)
			}
			ruleengine.ExecuteSelectedRules(device, rules)
		}
	}
	return nil
}
