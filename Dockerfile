FROM node:latest
RUN npm install --silent
CMD ["npm", "start"]
EXPOSE 3000 6379