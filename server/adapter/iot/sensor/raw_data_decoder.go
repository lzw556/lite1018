package sensor

type RawDataDecoder interface {
	Decode(data []byte) ([]byte, error)
}
