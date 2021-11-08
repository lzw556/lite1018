package initialize

import "os"

func InitFolder() {
	_, err := os.Stat("data")
	if os.IsNotExist(err) {
		if err := os.Mkdir("data", os.ModePerm); err != nil {
			panic(err)
		}
	}
	_, err = os.Stat("logs")
	if os.IsNotExist(err) {
		if err := os.Mkdir("logs", os.ModePerm); err != nil {
			panic(err)
		}
	}
	_, err = os.Stat("resources")
	if os.IsNotExist(err) {
		if err := os.Mkdir("resources", os.ModePerm); err != nil {
			panic(err)
		}
	}
}
