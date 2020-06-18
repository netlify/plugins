FROM node:12.16.3
LABEL maintainer=Netlify

RUN apt update && apt install -y jq

COPY plugins.json .
RUN jq -r 'map(.package + "@" + .version) | join(" ")' plugins.json | xargs npm install
