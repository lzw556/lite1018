package command

import (
	uuid "github.com/satori/go.uuid"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
)

type command struct {
	reqID    string
	response chan pd.GeneralResponseMessage
}

func newCommand() command {
	return command{
		reqID:    uuid.NewV1().String(),
		response: make(chan pd.GeneralResponseMessage),
	}
}
