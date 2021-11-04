build_react:
	rm -rf server/static
	cd web && yarn build
	cp -rf web/build server/static
clean:
	rm ./bin/*
build:
ifeq ($(os),windows)
	CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build -tags=release -o ./bin/iotd.exe ./cmd/release.go
else
	CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 go build -tags=release -o ./bin/iotd ./cmd/release.go
endif

debug:
ifeq ($(os),windows)
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build -o ../bin/cloud.exe ./main.go
else
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 go build -o ../bin/cloud ./main.go
endif

proto:
	protoc --gogofast_out=. server/adapter/iot/dispatcher/proto/theta.proto