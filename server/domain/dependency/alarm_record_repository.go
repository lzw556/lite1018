package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type AlarmRecordRepository interface {
	Create(ctx context.Context, e *po.AlarmRecord) error
}
