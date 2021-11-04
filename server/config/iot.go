package config

type IoT struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Broker   string `json:"broker"`
	Server   struct {
		Port    int  `json:"port"`
		Enabled bool `json:"enabled"`
	} `json:"server"`
}
