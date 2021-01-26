# Improved-EOPSI

## Starting up server:

Starts up a new server and db instance. Make sure docker is downloaded.

### Client app: 
- docker-compose up

### Cloud app:
- docker-compose up

## Connecting to databae: 
- download pg admin from https://www.pgadmin.org/download/ and open a new pgAdmin window
- create a new server and put localhost, 5432 (client) and localhost, 5433 (cloud) as the Url/ port
- Password is in the file: .env/db.env

## Testing the service:
- donwload postman
- After starting the 2 services, test a connection by doing a get request to localhost:5000. or localhost:5001 
