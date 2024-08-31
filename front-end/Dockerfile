FROM node:18-alpine

WORKDIR /app

COPY package.json ./

# Install dependencies including Prisma CLI
RUN npm install


# Copy the rest of app's source code
COPY . .


# Run container on port 3000
EXPOSE 3000

CMD ["npm", "start"]