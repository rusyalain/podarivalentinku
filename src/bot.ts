import { Bot, conversations, MongoDBAdapter, session } from "./deps.ts";
import type { MyContext, SessionData } from "./types.ts";
import {
  handleStart,
  registrationConversation,
} from "./handlers/registration.ts";
import {
  handleClassSelection,
  handleMessage,
  handleRecipientSelection,
  handleSendValentine,
} from "./handlers/valentine.ts";
import {
  handleGlobalStats,
  handlePersonalStats,
} from "./handlers/statistics.ts";
import { createConversation } from "./deps.ts";
import db from "./database.ts";

const storage = new MongoDBAdapter<SessionData>({
  collection: db.getSessions(),
});

const bot = new Bot<MyContext>(Deno.env.get("TG_BOT_TOKEN") || "");

bot.use(async (ctx, next) => {
  if (ctx.from && db.blockedUsers) {
    const isBlocked = await db.blockedUsers.isUserBlocked(ctx.from.id);
    if (isBlocked) {
      await ctx.reply("Вы заблокированы и не можете использовать бота.");
      return;
    }
  }
  await next();
});

bot.use(session({
  initial: () => ({}),
  storage,
}));

bot.use(conversations());

bot.use(createConversation(registrationConversation));

bot.command("start", handleStart);

bot.command("block", async (ctx) => {
  if (!ctx.message) return;

  const adminId = parseInt(Deno.env.get("TG_ADMIN_ID") || "0");
  if (ctx.from?.id !== adminId) {
    await ctx.reply("У вас нет прав для выполнения этой команды.");
    return;
  }
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await ctx.reply("Используйте команду: /block <telegramId>");
    return;
  }
  const targetId = parseInt(args[1]);
  if (isNaN(targetId)) {
    await ctx.reply("Некорректный telegramId.");
    return;
  }
  if (!db.blockedUsers) {
    await ctx.reply("Ошибка базы данных.");
    return;
  }
  await db.blockedUsers.blockUser(targetId);
  await ctx.reply(`Пользователь с ID ${targetId} заблокирован.`);
});

bot.command("unblock", async (ctx) => {
  if (!ctx.message) return;

  const adminId = parseInt(Deno.env.get("TG_ADMIN_ID") || "0");
  if (ctx.from?.id !== adminId) {
    await ctx.reply("У вас нет прав для выполнения этой команды.");
    return;
  }
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await ctx.reply("Используйте команду: /unblock <telegramId>");
    return;
  }
  const targetId = parseInt(args[1]);
  if (isNaN(targetId)) {
    await ctx.reply("Некорректный telegramId.");
    return;
  }
  if (!db.blockedUsers) {
    await ctx.reply("Ошибка базы данных.");
    return;
  }
  await db.blockedUsers.unblockUser(targetId);
  await ctx.reply(`Пользователь с ID ${targetId} разблокирован.`);
});

bot.hears("💌 Отправить валентинку", handleSendValentine);
bot.hears("📊 Моя статистика", handlePersonalStats);
bot.hears("📈 Общая статистика", handleGlobalStats);

bot.on("message", async (ctx) => {
  if (!ctx.message?.text) return;

  switch (ctx.session.step) {
    case "choosing_class":
      await handleClassSelection(ctx);
      break;
    case "choosing_recipient":
      await handleRecipientSelection(ctx);
      break;
    case "entering_message":
      await handleMessage(ctx);
      break;
  }
});

bot.on("callback_query:data", async (ctx) => {
  try {
    const [action, messageId] = ctx.callbackQuery.data.split(":");

    if (action === "show_id") {
      await ctx.answerCallbackQuery({
        text: `ID сообщения: ${messageId}`,
        show_alert: true,
      });
    }
  } catch (error) {
    console.error("Callback query error:", error);
    await ctx.answerCallbackQuery({
      text: "Произошла ошибка",
      show_alert: true,
    });
  }
});

bot.start();
