FROM node:12.18.1
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
# RUN npm install
COPY . .
EXPOSE 5000

# For development usage only
CMD [ "npm","run", "dev" ]

# Change to this before deployment
# CMD ["npm", "start"]

