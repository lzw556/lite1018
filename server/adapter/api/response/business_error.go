package response

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type BusinessError struct {
	Code   errcode.BusinessErrorCode
	Reason string
}

func (b BusinessError) Error() string {
	return fmt.Sprintf("bussiness error reason = %s, code = %d", b.Reason, b.Code)
}

func BusinessErr(code errcode.BusinessErrorCode, reason string) BusinessError {
	return BusinessError{
		Code:   code,
		Reason: reason,
	}
}

func UnknownBusinessErr(err error) BusinessError {
	return BusinessError{
		Code:   errcode.UnknownBusinessError,
		Reason: err.Error(),
	}
}
