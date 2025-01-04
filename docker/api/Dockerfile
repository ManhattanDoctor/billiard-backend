FROM node:18

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y lame
RUN apt-get install -y ffmpeg

WORKDIR /application

# Copy global node_modules
COPY ../../node_modules /application/node_modules
# Copy local node_modules
COPY ../../src/packages/application/api/node_modules /application/build/node_modules
# Copy compiled node_modules
COPY ../../src/packages/application/api/build/node_modules /application/build/node_modules
# Copy compiles files to working directory
COPY ../../src/packages/application/api/build/src/packages/application/api /application/build
# Copy locale file
COPY ../../locale /application/build/locale
# Copy env file
COPY ../../docker/api/.env /application/build

# Set directory
WORKDIR /application/build
CMD node main.js
