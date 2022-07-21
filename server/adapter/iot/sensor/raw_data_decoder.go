package sensor

type RawDataDecoder interface {
	Decode(data []byte, metaLength int) (map[string]interface{}, error)
}
