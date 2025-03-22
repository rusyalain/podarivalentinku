import { MyContext } from "../types.ts";
import db from "../database.ts";
import {
  getClassesKeyboard,
  getMainKeyboard,
  getMessageKeyboard,
  getUsersKeyboard,
} from "../keyboards.ts";
import { moderationService } from "../services/moderation_service.ts";
import { User } from "../types.ts";

export async function handleSendValentine(ctx: MyContext) {
  try {
    if (!db.users) {
      throw new Error("Users repository not initialized");
    }

    const classes = await db.users.getClassesList();

    if (classes.length === 0) {
      await ctx.reply(
        "К сожалению, пока нет зарегистрированных пользователей. Как вы сюда попали, не зарегистрировавшись..?",
      );
      return;
    }

    ctx.session.classesPage = 0;

    await ctx.reply("Выберите класс получателя:", {
      reply_markup: getClassesKeyboard(classes, ctx.session.classesPage),
    });

    ctx.session.step = "choosing_class";
  } catch (error) {
    console.error("Error in handleSendValentine:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

export async function handleClassSelection(ctx: MyContext) {
  try {
    if (!ctx.message?.text || !db.users) {
      return;
    }

    if (ctx.message.text === "🏠 Главное меню") {
      await handleReturnToMainMenu(ctx);
      return;
    }

    const classes = await db.users.getClassesList();
    const totalPages = Math.ceil(classes.length / 8);

    if (await handleClassPagination(ctx, classes, totalPages)) {
      return;
    }

    const selectedClass = ctx.message.text;
    const users = await db.users.findByClass(selectedClass);

    if (users.length === 0) {
      await ctx.reply(
        "В этом классе пока нет зарегистрированных пользователей. Выберите другой класс:",
        { reply_markup: getClassesKeyboard(classes, ctx.session.classesPage) },
      );
      return;
    }

    ctx.session.selectedClass = selectedClass;
    ctx.session.usersPage = 0;

    await ctx.reply("Выберите получателя:", {
      reply_markup: getUsersKeyboard(users, ctx.session.usersPage),
    });

    ctx.session.step = "choosing_recipient";
  } catch (error) {
    console.error("Error in handleClassSelection:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

export async function handleRecipientSelection(ctx: MyContext) {
  try {
    if (!ctx.message?.text || !db.users) {
      return;
    }

    if (ctx.message.text === "↩️ Назад к классам") {
      await handleReturnToClassSelection(ctx);
      return;
    }

    if (ctx.session.selectedClass) {
      const users = await db.users.findByClass(ctx.session.selectedClass);
      if (await handleUsersPagination(ctx, users)) {
        return;
      }
    }

    const [lastName, firstName] = ctx.message.text.split(" ");
    const users = await db.users.findByClass(ctx.session.selectedClass || "");
    const recipient = users.find(
      (u) => u.lastName === lastName && u.firstName === firstName,
    );

    if (!recipient) {
      await ctx.reply("Получатель не найден. Пожалуйста, попробуйте снова.", {
        reply_markup: getUsersKeyboard(users, ctx.session.usersPage),
      });
      return;
    }

    ctx.session.selectedUser = recipient;

    await ctx.reply("Введите текст валентинки:", {
      reply_markup: getMessageKeyboard(),
    });

    ctx.session.step = "entering_message";
  } catch (error) {
    console.error("Error in handleRecipientSelection:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

export async function handleMessage(ctx: MyContext) {
  try {
    if (!ctx.message?.text || !db.valentines) {
      return;
    }

    if (ctx.message.text === "❌ Отменить отправку") {
      await handleReturnToMainMenu(ctx);
      return;
    }

    if (!ctx.session.selectedUser) {
      return;
    }

    const isInappropriate = await moderationService.moderateMessage(
      ctx.message.text,
    );
    if (isInappropriate === "1") {
      await ctx.reply(
        "К сожалению, ваше сообщение не прошло модерацию. Пожалуйста, попробуйте отправить другое сообщение.",
        { reply_markup: getMessageKeyboard() },
      );
      return;
    }

    const messageId = await db.valentines.create(
      ctx.from?.id || 0,
      ctx.session.selectedUser.telegramId,
    );

    await ctx.api.sendMessage(
      ctx.session.selectedUser.telegramId,
      `💌 У вас новая валентинка!\n\nСообщение: ${ctx.message.text}`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Показать ID сообщения",
              callback_data: `show_id:${messageId}`,
            },
          ]],
        },
      },
    );

    await ctx.reply(
      `Валентинка успешно отправлена!`,
      { reply_markup: getMainKeyboard() },
    );

    await resetSession(ctx);
  } catch (error) {
    console.error("Error in handleMessage:", error);
    await ctx.reply(
      "Произошла ошибка при отправке валентинки. Пожалуйста, попробуйте позже.",
    );
  }
}

async function handleReturnToMainMenu(ctx: MyContext) {
  await ctx.reply("Вы вернулись в главное меню.", {
    reply_markup: getMainKeyboard(),
  });
  await resetSession(ctx);
}

async function handleReturnToClassSelection(ctx: MyContext) {
  if (!db.users) {
    throw new Error("Users repository not initialized");
  }

  const classes = await db.users.getClassesList();
  await ctx.reply("Выберите класс получателя:", {
    reply_markup: getClassesKeyboard(classes, ctx.session.classesPage),
  });

  ctx.session.step = "choosing_class";
  ctx.session.selectedClass = undefined;
  ctx.session.selectedUser = undefined;
  ctx.session.usersPage = undefined;
}

async function handleClassPagination(
  ctx: MyContext,
  classes: string[],
  totalPages: number,
): Promise<boolean> {
  if (ctx.message?.text === "⬅️") {
    if (ctx.session.classesPage && ctx.session.classesPage > 0) {
      ctx.session.classesPage--;
      await ctx.reply("Выберите класс получателя:", {
        reply_markup: getClassesKeyboard(classes, ctx.session.classesPage),
      });
    }
    return true;
  }

  if (ctx.message?.text === "➡️") {
    if (
      ctx.session.classesPage !== undefined &&
      ctx.session.classesPage < totalPages - 1
    ) {
      ctx.session.classesPage++;
      await ctx.reply("Выберите класс получателя:", {
        reply_markup: getClassesKeyboard(classes, ctx.session.classesPage),
      });
    }
    return true;
  }

  return false;
}

async function handleUsersPagination(
  ctx: MyContext,
  users: User[],
): Promise<boolean> {
  const totalPages = Math.ceil(users.length / 8);

  if (ctx.message?.text === "⬅️") {
    if (ctx.session.usersPage && ctx.session.usersPage > 0) {
      ctx.session.usersPage--;
      await ctx.reply("Выберите получателя:", {
        reply_markup: getUsersKeyboard(users, ctx.session.usersPage),
      });
    }
    return true;
  }

  if (ctx.message?.text === "➡️") {
    if (
      ctx.session.usersPage !== undefined &&
      ctx.session.usersPage < totalPages - 1
    ) {
      ctx.session.usersPage++;
      await ctx.reply("Выберите получателя:", {
        reply_markup: getUsersKeyboard(users, ctx.session.usersPage),
      });
    }
    return true;
  }

  return false;
}

function resetSession(ctx: MyContext) {
  ctx.session.step = undefined;
  ctx.session.selectedClass = undefined;
  ctx.session.selectedUser = undefined;
  ctx.session.classesPage = undefined;
  ctx.session.usersPage = undefined;
}
