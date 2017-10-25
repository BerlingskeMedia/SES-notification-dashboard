SES Notifications Dashboard
====================

config.sh
```
#!/bin/bash

export ACCESS_KEY_ID={ID}
export SECRET_ACCESS_KEY={SECRET}
export AWS_REGION=eu-west-1
```

Running the app
```
npm install //required only once after cloning
. config.sh //required once every session
node app.js
```

App should default to localhost:3000
