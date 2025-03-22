FROM denoland/deno:latest

WORKDIR /app

COPY . .

# порт бд вне контейнера
EXPOSE 27018

RUN deno cache --allow-import src/bot.ts

CMD ["deno", "run", "--allow-all","src/bot.ts"]