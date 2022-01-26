FROM golang:1.17.2-alpine as builder

RUN apk add --no-cache \
    git

RUN git config --global url."http://onlylin:8da992bc6bc24c7eb9bd419913f277621e68dcf8@github.com".insteadOf "https://github.com"

RUN mkdir -p /go/src/github.com/thetasensors/webapp
WORKDIR /go/src/github.com/thetasensors/webapp


ENV GO11MODULE on
ENV GOPRIVATE github.com/thetasensors
ENV GOPROXY https://goproxy.cn

# Cache dependencies
COPY go.mod .
COPY go.sum .

RUN go mod download

# Build real binarie
COPY . .

RUN cd server && CGO_ENABLED=1 GOOS=linux GOARCH=amd64 CC=x86_64-linux-musl-gcc go build -ldflags "-linkmode external -extldflags -static" -o ../bin/cloud-lite ./main.go

FROM alpine

COPY --from=builder /go/src/github.com/thetasensors/webapp/bin/cloud-lite /cloud-lite

WORKDIR /

ENTRYPOINT ["/cloud-lite"]
