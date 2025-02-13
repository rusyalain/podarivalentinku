FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache --allow-import --unstable src/bot.ts

EXPOSE 1337

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-import", "--allow-read", "--allow-write", "src/bot.ts"]