import { Keyboard } from "./deps.ts";
import type { User } from "./types.ts";

export function getMainKeyboard(): Keyboard {
  return new Keyboard()
    .text("💌 Отправить валентинку")
    .row()
    .text("📊 Моя статистика")
    .text("📈 Общая статистика")
    .resized();
}

export function getClassesKeyboard(
  classes: string[],
  page: number = 0,
): Keyboard {
  const keyboard = new Keyboard();
  const itemsPerPage = 8;
  const start = page * itemsPerPage;
  const end = Math.min(start + itemsPerPage, classes.length);
  const totalPages = Math.ceil(classes.length / itemsPerPage);

  for (let i = start; i < end; i++) {
    keyboard.text(classes[i]);
    if ((i - start + 1) % 2 === 0) keyboard.row();
  }

  if (classes.length > itemsPerPage) {
    keyboard.row();
    if (page > 0) {
      keyboard.text("⬅️");
    }
    if (page < totalPages - 1) {
      keyboard.text("➡️");
    }
  }

  keyboard.row().text("🏠 Главное меню");

  return keyboard.resized();
}

export function getUsersKeyboard(users: User[], page: number = 0): Keyboard {
  const keyboard = new Keyboard();
  const itemsPerPage = 8;
  const start = page * itemsPerPage;
  const end = Math.min(start + itemsPerPage, users.length);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  for (let i = start; i < end; i++) {
    keyboard.text(`${users[i].lastName} ${users[i].firstName}`);
    if ((i - start + 1) % 2 === 0) keyboard.row();
  }

  if (users.length > itemsPerPage) {
    keyboard.row();
    if (page > 0) {
      keyboard.text("⬅️");
    }
    if (page < totalPages - 1) {
      keyboard.text("➡️");
    }
  }

  keyboard.row().text("↩️ Назад к классам");

  return keyboard.resized();
}

export function getMessageKeyboard(): Keyboard {
  return new Keyboard()
    .text("❌ Отменить отправку")
    .resized();
}
