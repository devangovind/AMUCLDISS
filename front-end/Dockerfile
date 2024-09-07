FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

# Copy the rest of app's source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

