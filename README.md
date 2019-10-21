# Chat App

Small Chat app focuses on horizontal scaling. Uses docker, traefik, node and redis.
This repo has own front-end interface for chat `chat-fe/`

## Initial installation

- clone this repository
- `cd chat-node-server & npm install`
- `cd chat-fe & npm install`

## Running docker
After the project setup, `cd` to project folder `chat-app/`
- run `docker-compose build`
- after build run `docker-compose --compatibility up`

## Running Chat FE
- `cd chat-fe`
- `npm run serve` (which will be hosted in localhost:8081)
 
## Notes
- available usernames `raymund`, `rj`, `noe`, `charm`.
- make sure to run the `docker` first before the `chat-fe`
- You can check traefik dashboard in `localhost:8080`