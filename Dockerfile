FROM node:14-alpine

COPY . /srv/
WORKDIR /srv

RUN /usr/local/bin/npm install

CMD /usr/local/bin/node main.js