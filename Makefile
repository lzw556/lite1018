build:
	rm -rf server/adapter/api/static
	cd web && yarn build
	cp -rf web/build server/adapter/api/static

proto:
	protoc --gogofast_out=. server/adapter/iot/dispatcher/proto/theta.proto