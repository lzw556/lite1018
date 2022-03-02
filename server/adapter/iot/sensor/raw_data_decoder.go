package sensor

type RawDataDecoder interface {
	Decode(data []byte) (map[string]interface{}, error)
}
