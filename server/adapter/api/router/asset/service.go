package asset

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
)

type Service interface {
	CreateAsset(req request.CreateAsset) error
}
