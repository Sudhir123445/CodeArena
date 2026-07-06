FROM node:24-alpine

# Install Docker CLI so the worker can use 'docker run' via child_process
RUN apk add --no-cache docker-cli

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
