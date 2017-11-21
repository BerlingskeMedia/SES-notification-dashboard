FROM ubuntu:16.04

# Installing wget - needed to download node.js
RUN apt-get update && apt-get install -y wget

# Using latest LTS release.
ENV NODE_VERSION v8.7.0

# Downloading and installing Node.
RUN wget -O - https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-x64.tar.gz \
    | tar xzf - --strip-components=1 --exclude="README.md" --exclude="LICENSE" \
    --exclude="ChangeLog" -C "/usr/local"

# Set the working directory.
WORKDIR /SES-bounce-notification

# Copying the code into image. Be aware no config files are including.
COPY ./app /SES-bounce-notification
COPY ./node_modules /SES-bounce-notification/node_modules

# Exposing our endpoint to Docker.
EXPOSE 3000

# When starting a container with our image, this command will be run.
CMD ["node", "app.js"]
