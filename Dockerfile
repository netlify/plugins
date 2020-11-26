FROM node:12.16.3
LABEL maintainer=Netlify

WORKDIR /plugins

RUN apt update && apt install -y jq && npm init -y

ENV CYPRESS_INSTALL_BINARY=0
COPY site/plugins.json .
RUN jq -r 'map(.package + "@" + .version) | join(" ")' site/plugins.json | xargs npm install
