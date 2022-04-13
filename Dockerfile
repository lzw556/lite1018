FROM golang:1.18-alpine as builder

RUN apk add --no-cache \
    git \
    build-base

RUN git config --global url."http://onlylin:8da992bc6bc24c7eb9bd419913f277621e68dcf8@github.com".insteadOf "https://github.com"

RUN mkdir -p /go/src/github.com/thetasensors/cloud-lite
WORKDIR /go/src/github.com/thetasensors/cloud-lite


ENV GO11MODULE on
ENV GOPRIVATE github.com/thetasensors
#ENV GOPROXY https://goproxy.cn

# Cache dependencies
COPY ./server/go.mod .
COPY ./server/go.sum .

RUN go mod tidy

RUN go mod download

# Build real binarie
COPY ./server .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o ./bin/cloud-lite ./main.go

FROM alpine

COPY --from=builder /go/src/github.com/thetasensors/cloud-lite/bin/cloud-lite /cloud-lite

WORKDIR /

ENTRYPOINT ["/cloud-lite"]
