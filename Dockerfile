FROM node:10.16-alpine AS production

LABEL maintainer="xpiku@berlingskemedia.dk"

# Set the working directory.
WORKDIR /SES-bounce-notification

# Copying the code into image. Be aware no config files are including.
COPY . /SES-bounce-notification
RUN npm ci
RUN echo Build date `date +%Y-%m-%d` > /SES-bounce-notification/version

# Exposing our endpoint to Docker.
EXPOSE 3000

# When starting a container with our image, this command will be run.
CMD ["npm", "start"]
