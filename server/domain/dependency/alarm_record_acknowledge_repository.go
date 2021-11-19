package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRecordAcknowledgeRepository interface {
	Create(ctx context.Context, e *po.AlarmRecordAcknowledge) error
}
