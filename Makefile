react_install:
	cd web && yarn install

react_build:
	rm -rf server/static
	cd web && yarn build
	cp -rf web/build server/static
clean:
	rm ./bin/*

debug:
ifeq ($(os),windows)
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build --tags theta -o ../bin/cloud.exe ./main.go
endif
ifeq ($(os),linux)
	cd server && CGO_ENABLED=1 GOOS=linux GOARCH=amd64 CC=x86_64-linux-musl-gcc go build --tags theta -ldflags "-linkmode external -extldflags -static" -o ../bin/cloud-lite ./main.go
endif
ifeq ($(os),drawin)
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 go build --tags theta -o ../bin/cloud ./main.go
endif

license:
ifeq ($(os),windows)
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 CC=x86_64-w64-mingw32-gcc go build --tags license -o ../deploy/script/windows/bin/cloud-lite.exe ./license.go
endif
ifeq ($(os),linux)
	cd server && CGO_ENABLED=1 GOOS=linux GOARCH=amd64 CC=x86_64-linux-musl-gcc go build --tags license -ldflags "-linkmode external -extldflags -static" -o ../deploy/script/linux/bin/cloud-lite ./license.go
endif
ifeq ($(os),drawin)
	cd server && CGO_ENABLED=1 GOOS=$(os) GOARCH=amd64 go build --tags license -o ../bin/cloud ./main.go
endif

proto:
	protoc --gogofast_out=. server/adapter/iot/proto/theta.proto