package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordAcknowledgeRepository interface {
	Create(ctx context.Context, e *entity.AlarmRecordAcknowledge) error
	GetSpecs(ctx context.Context, specs ...spec.Specification) (entity.AlarmRecordAcknowledge, error)
}
