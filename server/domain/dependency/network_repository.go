package dependency

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type NetworkRepository interface {
	Create(ctx context.Context, e *po.Network) error
	Delete(ctx context.Context, id uint) error

	Get(ctx context.Context, id uint) (entity.Network, error)
	GetBySpecs(ctx context.Context, specs ...specification.Specification) (entity.Network, error)
	Find(ctx context.Context, ids ...uint) ([]entity.Network, error)

	UpdateByGatewayID(ctx context.Context, gatewayID, period, timeOffset uint) error
	Save(ctx context.Context, e *po.Network) error
}
