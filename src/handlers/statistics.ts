import { MyContext } from "../types.ts";
import db from "../database.ts";

export async function handleGlobalStats(ctx: MyContext) {
  try {
    if (!db.users || !db.valentines) {
      throw new Error("Repositories not initialized");
    }
    const totalValentines = await db.valentines.getTotalCount();
    const topSenders = await db.valentines.getTopUsers("senderId", 5);
    const topRecipients = await db.valentines.getTopUsers("recipientId", 5);

    // Форматируем топы
    const sendersFormatted = await Promise.all(
      topSenders.map(async (sender, index) => {
        const user = await db.users?.findByTelegramId(sender._id);
        if (!user) return null;
        return `${index + 1}. ${user.lastName} ${user.firstName} (${user.class}) - ${sender.count} валентинок`;
      }),
    );

    const recipientsFormatted = await Promise.all(
      topRecipients.map(async (recipient, index) => {
        const user = await db.users?.findByTelegramId(recipient._id);
        if (!user) return null;
        return `${index + 1}. ${user.lastName} ${user.firstName} (${user.class}) - ${recipient.count} валентинок`;
      }),
    );
    const message =
      "📊 Общая статистика валентинок\n\n" +
      `Всего отправлено валентинок: ${totalValentines}\n\n` +
      "🏆 Топ отправителей:\n" +
      sendersFormatted.filter(Boolean).join("\n") +
      "\n\n" +
      "💝 Топ получателей:\n" +
      recipientsFormatted.filter(Boolean).join("\n");

    await ctx.reply(message);
  } catch (error) {
    console.error("Error getting global stats:", error);
    await ctx.reply("Извините, произошла ошибка при получении статистики.");
  }
}

export async function handlePersonalStats(ctx: MyContext) {
  try {
    if (!db.users || !db.valentines) {
      throw new Error("Repositories not initialized");
    }

    const user = await db.users.findByTelegramId(ctx.from?.id || 0);
    if (!user) {
      await ctx.reply(
        "Вы ещё не зарегистрированы в системе. " +
          "Используйте команду /start для регистрации.",
      );
      return;
    }

    const stats = await db.valentines.getUserStatistics(ctx.from?.id || 0);

    const message =
      "📊 Ваша личная статистика\n\n" +
      `Отправлено валентинок: ${stats.sent}\n` +
      `Получено валентинок: ${stats.received}\n\n` +
      `Всего взаимодействий: ${stats.sent + stats.received}`;

    await ctx.reply(message);
  } catch (error) {
    console.error("Error getting personal stats:", error);
    await ctx.reply(
      "Извините, произошла ошибка при получении вашей статистики.",
    );
  }
}