package po

type MQTTConfig struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Server   struct {
		Enabled bool `json:"enabled"`
		Port    int  `json:"port"`
	} `json:"server"`
	Client struct {
		Broker string `json:"broker"`
	}
}

type DatabaseConfig struct {
	Driver   string `json:"driver"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type System struct {
	Config struct {
		MQTT     MQTTConfig     `json:"mqtt"`
		Database DatabaseConfig `json:"database"`
	} `json:"config"`
}

func (System) BucketName() string {
	return "ts_system"
}
