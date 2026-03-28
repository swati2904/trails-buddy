FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

COPY . .
RUN npm run build && \
    if [ -d dist ]; then cp -r dist /tmp/frontend-out; \
    elif [ -d build ]; then cp -r build /tmp/frontend-out; \
    else echo "No dist or build output found" && exit 1; fi

FROM nginx:1.27-alpine AS runtime
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/frontend-out/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
