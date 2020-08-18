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
###### local
```
npm i
. .env
ng serve // in first terminal
npm start // in second terminal
```
app runs on localhost:4200 in local
###### prod-alike (normally this uses dockerfile)
```
npm ci
. .env
npm start
```
