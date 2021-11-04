package request

type System struct {
	MQTTUsername string `json:"mqtt_username"`
	MQTTPassword string `json:"mqtt_password"`
	MQTTPort     int    `json:"mqtt_port"`
	DBType       string `json:"db_type"`
	DBHost       string `json:"db_host"`
	DBPort       int    `json:"db_port"`
	DBUsername   string `json:"db_username"`
	DBPassword   string `json:"db_password"`
	DBName       string `json:"db_name"`
}
