SES Notifications Dashboard
====================
#### MonoRepo for Angular 10 + NodeJS


.env
```
#!/bin/bash

export ACCESS_KEY_ID={ID}
export SECRET_ACCESS_KEY={SECRET}
export AWS_REGION=eu-west-1
```

#### Running the app
###### locally with docker
```
cp .env.dist .env
docker-compose up
```
app runs on localhost:3000 in local

app runs on localhost:4200 in local
###### prod-alike (normally this uses dockerfile)
```
npm ci
. .env
npm start
```
