package utils

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
)

func reverseBytes(bytes []byte) []byte {
	for i, j := 0, len(bytes)-1; i < j; i, j = i+1, j-1 {
		bytes[i], bytes[j] = bytes[j], bytes[i]
	}
	return bytes
}

func StringToBytes(order binary.ByteOrder, data string) []byte {
	bytes, err := hex.DecodeString(data)
	if err != nil {
		fmt.Println(err)
	}
	if order == binary.LittleEndian {
		return reverseBytes(bytes)
	}
	return bytes
}
