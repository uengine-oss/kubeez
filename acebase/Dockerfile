FROM node:current-alpine3.18
VOLUME /tmp
#
#RUN npm install -g spa-http-server

ADD . /acebase-app
WORKDIR /acebase-app
RUN npm install
EXPOSE 5757
ENTRYPOINT ["node","main.js"]