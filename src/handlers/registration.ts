import { MyContext, MyConversation, MyConversationContext } from "../types.ts";
import db from "../database.ts";
import { getMainKeyboard } from "../keyboards.ts";

function isValidName(name: string): boolean {
  if (name.startsWith("/") || name.includes(" ")) {
    return false;
  }
  return /^[А-Яа-яЁё-]+$/.test(name);
}

export async function handleStart(ctx: MyContext) {
  try {
    if (!db.users) {
      throw new Error("Users repository not initialized");
    }
    const user = await db.users.findByTelegramId(ctx.from?.id || 0);

    if (user) {
      await ctx.reply("С возвращением! Вы уже авторизованы в системе.", {
        reply_markup: getMainKeyboard(),
      });
      return;
    }
    await ctx.conversation.enter("registrationConversation");
  } catch (error) {
    console.error("Error in handleStart:", error);
    await ctx.reply(
      "Ой-ой! Что-то пошло не так... Похоже, кого-то сегодня уволят..",
    );
  }
}

export async function registrationConversation(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(
      "Добро пожаловать!\nУчаствуя в проекте, Вы подтверждаете, что ознакомились с правилами проекта.\nПомните, что относиться ко всем стоит уважительно!",
    );
    await ctx.reply(
      "Давайте зарегистрируемся в системе. Вводите свои ТОЛЬКО НАСТОЯЩИЕ данные, чтобы сообщения доставлялись задуманным пользователям.\nПомните, что оскорбляющее чувства других людей поведение карается полной блокировкой.",
    );
    let firstName: string;
    while (true) {
      await ctx.reply(
        "Введите ваше имя (с большой буквы, одно слово, только буквы русского алфавита):",
      );
      const firstNameMsg = await conversation.waitFor(":text");
      firstName = firstNameMsg.message?.text as string;
      if (isValidName(firstName)) {
        break;
      }
      await ctx.reply(
        "Некорректное имя. Пожалуйста, введите одно слово, используя только буквы русского алфавита.\nНапример, Кирилл (но, возможно, Кирюша), Лера, Родион",
      );
    }

    let lastName: string;
    while (true) {
      await ctx.reply(
        "Введите вашу фамилию (с большой буквы, одно слово, только буквы русского алфавита):",
      );
      const lastNameMsg = await conversation.waitFor(":text");
      lastName = lastNameMsg.message?.text as string;

      if (isValidName(lastName)) {
        break;
      }
      await ctx.reply(
        "Некорректная фамилия. Пожалуйста, введите одно слово, используя только буквы русского алфавита.\nНапример: Яруллин, Мифтахова, Бакова",
      );
    }
    let className: string;
    while (true) {
      await ctx.reply("Введите ваш класс (например, 11А):");
      const classMsg = await conversation.waitFor(":text");
      className = classMsg.message?.text as string;
      if (/^(?:[1-9]|10|11)[А-ЯЁ]$/.test(className)) {
        break;
      }
      await ctx.reply(
        "Неправильный формат класса. Используйте формат: число + заглавная буква русского алфавита. " +
          "Например: 9Г, 8Ж, 11А",
      );
    }
    if (!db.users) {
      throw new Error("Users repository not initialized");
    }
    await db.users.create(ctx.from?.id || 0, firstName, lastName, className);
    await ctx.reply(
      "Регистрация успешно завершена!\nТеперь вы можете отправлять валентинки. Но помните, с большой силой приходит большая ответственность!",
      { reply_markup: getMainKeyboard() },
    );
  } catch (error) {
    console.error("Registration error:", error);
    await ctx.reply(
      "Ой-ой! Что-то пошло не так... Похоже, кого-то сегодня уволят..",
    );
  }
}
