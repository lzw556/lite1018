package process

import (
	"context"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type CalibrationStatus struct {
	eventRepo dependency.EventRepository
}

func NewCalibrationStatus() Processor {
	return newRoot(
		&CalibrationStatus{
			eventRepo: repository.Event{},
		},
	)
}

func (p CalibrationStatus) Name() string {
	return "CalibrationStatus"
}

func (p CalibrationStatus) Next() Processor {
	return nil
}

func (p CalibrationStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.CalibrateStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [CalibrationStatus] message failed： %v", err)
			}
			event := entity.Event{
				Code:      entity.EventCodeCalibration,
				Category:  entity.EventCategoryDevice,
				SourceID:  device.ID,
				ProjectID: device.ProjectID,
				Timestamp: int64(m.Timestamp),
				Content:   fmt.Sprintf(`{"code": %d}`, m.Code),
			}
			if err := p.eventRepo.Create(context.TODO(), &event); err != nil {
				return fmt.Errorf("create [CalibrationStatus] event failed： %v", err)
			}
		}
	}
	return nil
}
