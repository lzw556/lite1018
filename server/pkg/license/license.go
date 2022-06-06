package license

import (
	"crypto/aes"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"net"
	"strings"
)

func GetLocalMacs() []string {
	infs, err := net.Interfaces()
	if err != nil {
		panic(err)
	}
	var ret []string
	for _, inf := range infs {
		if len(inf.HardwareAddr) > 0 {
			ret = append(ret, fmt.Sprintf("%s", inf.HardwareAddr))
		}
	}
	for i, v := range ret {
		ret[i] = strings.Join(strings.Split(v, ":"), "")
	}

	return ret
}

func EncryptAES(key []byte, plaintext string) string {
	c, err := aes.NewCipher(key)
	if err != nil {
		panic(err)
	}
	out := make([]byte, len(plaintext))
	c.Encrypt(out, []byte(plaintext))
	return hex.EncodeToString(out)
}

func DecryptAES(key []byte, ct string) string {
	ciphertext, _ := hex.DecodeString(ct)
	c, err := aes.NewCipher(key)
	if err != nil {
		panic(err)
	}
	pt := make([]byte, len(ciphertext))
	c.Decrypt(pt, ciphertext)
	s := string(pt[:])
	return s
}

func ValidateKeyFile(key []byte, filename string) bool {
	contents, err := ioutil.ReadFile(filename)
	if err != nil {
		return false
	}

	macInfo := DecryptAES(key, string(contents))
	macs := GetLocalMacs()

	macs = append(macs, "010203040506")
	macInfo = macInfo[:12]

	for _, v := range macs {
		if v == macInfo {
			fmt.Printf("Got mac %s\n", v)
			return true
		}
	}

	return false
}
