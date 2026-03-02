# ---------- BUILD CON BUN ----------
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

# build angular
RUN bunx ng build my-landing --configuration production


# ---------- NGINX ----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ ESTA ES LA RUTA CORRECTA EN TU CASO
COPY --from=build /app/dist/my-landing /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]