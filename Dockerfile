FROM ubuntu:16.04

# Installing wget - needed to download node.js
RUN apt-get update && apt-get install -y wget

# Using latest LTS release.
# Latest LTS v6.10.0 is not supported by our jenkins
ENV NODE_VERSION v6.10.3

# Downloading and installing Node.
RUN wget -O - https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.gz \
    | tar xzf - --strip-components=1 --exclude="README.md" --exclude="LICENSE" \
    --exclude="ChangeLog" -C "/usr/local"

# Set the working directory.
WORKDIR /SES-bounce-notification

# Copying the code into image. Be aware no config files are including.
COPY ./aws-dynamo-api /SES-bounce-notification/aws-dynamo-api
COPY ./css /SES-bounce-notification/css
COPY ./js /SES-bounce-notification/js
COPY ./partials /SES-bounce-notification/partials
COPY ./routes /SES-bounce-notification/routes
COPY ./templates /SES-bounce-notification/templates
COPY ./node_modules /SES-bounce-notification/node_modules

# Exposing our endpoint to Docker.
EXPOSE 3000

# When starting a container with our image, this command will be run.
CMD ["node", "/SES-bounce-notification/app.js"]
