package response

type OpenApiError struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

func (e OpenApiError) Error() string {
	return e.Msg
}

func ErrOpenApiProjectNotFound() OpenApiError {
	return OpenApiError{
		Code: 1001,
		Msg:  "项目不存在",
	}
}

func ErrOpenApiDeviceNotFound() OpenApiError {
	return OpenApiError{
		Code: 1002,
		Msg:  "设备不存在",
	}
}

func ErrOpenApiAssetNotFound() OpenApiError {
	return OpenApiError{
		Code: 1003,
		Msg:  "资产不存在",
	}
}

func ErrOpenApiMonitoringPointNotFound() OpenApiError {
	return OpenApiError{
		Code: 1004,
		Msg:  "监测点不存在",
	}
}

func ErrOpenApiInvalidToken() OpenApiError {
	return OpenApiError{
		Code: 401,
		Msg:  "无效的访问凭证",
	}
}

func ErrOpenApiBadRequest(msg string) OpenApiError {
	return OpenApiError{
		Code: 400,
		Msg:  msg,
	}
}
