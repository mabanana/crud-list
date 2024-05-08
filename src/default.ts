const TELEGRAM_API_URL = "https://api.telegram.org";

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: {
      id: number;
    };
  };
}

async function sendTextMessage(text: string, chatId: number, botToken: string) {
  return fetch(TELEGRAM_API_URL + "/bot" + botToken + "/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}

export { TELEGRAM_API_URL, TelegramUpdate, sendTextMessage };
