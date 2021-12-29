package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type AlarmRecordAcknowledgeRepository interface {
	Create(ctx context.Context, e *po.AlarmRecordAcknowledge) error
	GetSpecs(ctx context.Context, specs ...spec.Specification) (po.AlarmRecordAcknowledge, error)
}
