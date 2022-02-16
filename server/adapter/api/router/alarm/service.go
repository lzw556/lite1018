package alarm

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"

type Service interface {
	CreateAlarm(req request.CreateAlarm) error
}
