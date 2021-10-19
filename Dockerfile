FROM node:16-alpine

COPY . .

RUN cd kahoot-client && npm install && npm run build

RUN npm install && npm run build

CMD ["npm", "run", "start"]