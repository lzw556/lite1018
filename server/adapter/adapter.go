package adapter

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/ruleengine"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/socket"
)

var (
	Socket     *socket.Adapter
	IoT        *iot.Adapter
	Api        *api.Adapter
	RuleEngine *ruleengine.Adapter
)
