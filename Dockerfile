FROM golang:alpine AS build

WORKDIR /app
#/go/github.com/platipus25/wallpaperconstructor/web
COPY . .

ENV GOOS=js
ENV GOARCH=wasm

RUN apk update && apk add git
RUN go get -d -v ./wasm
RUN go build -v -o main.wasm ./wasm
RUN cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

FROM httpd:alpine
WORKDIR /usr/local/apache2/htdocs/

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./public .
COPY --from=build /app/wasm_exec.js .
COPY --from=build /app/main.wasm .
