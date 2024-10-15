# User Management

## Description
A simple ticket shop API that allows users to buy tickets for events and admins to manage events.

## Setup
1. `npm install` (Install dependencies)
2. `cp .env.example .env` (Copy the .env.example file to .env)
3. `docker compose up db -d` (Start the database container)
6. `npm run start:dev:local` (Start the api in development mode)
7. Go to `http://localhost:3000/api/v1` to view the Swagger documentation

### Testing

> [!NOTE]
> The test scripts assume that you run linux or MacOS. If you are using Windows, you may need to change them.

* `npm run test:unit` (Run unit tests)
* `npm run test:e2e` (Run e2e tests, Linux/MacOS only - see npm script)
* `npm run test:e2e` (Run again if the first run fails, docker container may not be ready)

> [!TIP]
> If you are using docker compose in userspace, you can run `npm run test:e2e:user` instead.

### Troubleshooting
* Windows handles docker volumes differently than Linux and MacOS. If you are using Windows, you may need to change the volume paths in the `docker-compose.yml` file.
* If you are having trouble with the database, you may need to run `docker compose down -v` to remove the volumes.