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

app runs on http://localhost:4200 and backend at http://localhost:3000

###### prod-alike (normally this uses dockerfile)
```
npm ci
. .env
npm start
```
