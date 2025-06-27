
FROM node:20-alpine AS build

WORKDIR /app


COPY package.json ./
COPY yarn.lock ./ 
RUN yarn install --frozen-lockfile # Or npm ci if using npm

COPY . .


RUN yarn build # Or npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./ 

RUN yarn install --production --frozen-lockfile # Or npm ci --production

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public


EXPOSE 3000 


CMD ["yarn", "start"] 