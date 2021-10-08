package config

type MQTT struct {
	Username string
	Password string
	Server   struct {
		Port    int
		Enabled bool
	}
	Client struct {
		Broker string
	}
}
