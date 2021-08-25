build:
	cd web && yarn build
	cp -rf web/dist server/adapter/api/dist