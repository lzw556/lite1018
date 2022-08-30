package iot

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"strings"
)

type (
	MessageHeader struct {
		Version string
		Type    string
	}

	MessageBody struct {
		Gateway string
		Device  string
		Payload []byte
	}

	Message struct {
		Header MessageHeader
		Body   MessageBody
	}
)

func parse(msg mqtt.Message) Message {
	str := strings.Split(msg.Topic(), "/")
	return Message{
		Header: MessageHeader{
			Version: str[1],
			Type:    str[7],
		},
		Body: MessageBody{
			Gateway: str[3],
			Device:  str[5],
			Payload: msg.Payload(),
		},
	}
}

type PublishMessage struct {
	Topic    string
	Qos      byte
	Retained bool
	Payload  []byte
}
