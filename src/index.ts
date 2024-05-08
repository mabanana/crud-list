import {
  HandleRequest,
  HttpRequest,
  HttpResponse,
  Config,
  Sqlite,
} from "@fermyon/spin-sdk";

import * as Default from "./default";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const botToken = Config.get("telegram_bot_token");
  const body: Default.TelegramUpdate = request.json();

  if (body.message === undefined) {
    return {
      status: 200,
    };
  }
  const chatId = body.message.chat.id;

  if (body.message.text === undefined) {
    await Default.sendTextMessage("Message text not found.", chatId, botToken);
    return {
      status: 200,
    };
  }

  const message = body.message.text;

  createTable();

  if (message.startsWith("/add ")) {
    addMessage(message.slice(5));
    Default.sendTextMessage("Message added.", chatId, botToken);
  } else if (message == "/list") {
    const messages = (await getMessages()).rows;
    if (!Array.isArray(messages) || messages.some((m) => !m.id || !m.message)) {
      throw new Error("Invalid messages format");
    }

    let messageList = "Messages:\n";

    for (let i = 0; i < messages.length; i++) {
      messageList += `ID: ${messages[i].id}, Message: ${messages[i].message}\n`;
    }
    if (messages.length === 0) {
      messageList += "No messages found.";
    }
    await Default.sendTextMessage(messageList, chatId, botToken);
  } else if (message.startsWith("/delete ")) {
    const id = parseInt(message.slice(8));
    deleteMessage(id);
    Default.sendTextMessage("Message deleted.", chatId, botToken);
  } else if (message.startsWith("/update ")) {
    const parts = message.slice(8).split(" ");
    if (parts.length < 2 || isNaN(parseInt(parts[0]))) {
      await Default.sendTextMessage(
        "Invalid format. Please use '/update id new_message'.",
        chatId,
        botToken
      );
    } else {
      const id = parseInt(parts[0]);
      const newMessage = parts.slice(1).join(" ");
      console.log(id, newMessage);
      updateMessage(id, newMessage);
      Default.sendTextMessage(
        "Message updated to: " + newMessage,
        chatId,
        botToken
      );
    }
  } else if (message.startsWith("/deletetable")) {
    deleteTable();
    Default.sendTextMessage("Table deleted.", chatId, botToken);
  } else {
    await Default.sendTextMessage("Invalid command.", chatId, botToken);
  }

  return {
    status: 200,
  };
};

function createTable() {
  let conn = Sqlite.openDefault();
  conn.execute(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT)",
    []
  );
}

function deleteTable() {
  let conn = Sqlite.openDefault();
  conn.execute("DROP TABLE messages", []);
}

function addMessage(message: string) {
  let conn = Sqlite.openDefault();
  let id = Date.now();
  conn.execute("INSERT INTO messages (id, message) VALUES (?, ?)", [
    id,
    message,
  ]);
}

async function getMessages() {
  let conn = Sqlite.openDefault();
  return await conn.execute("SELECT * FROM messages", []);
}

function deleteMessage(id: number) {
  let conn = Sqlite.openDefault();
  conn.execute("DELETE FROM messages WHERE id = ?", [id]);
}

function updateMessage(id: number, newMessage: string) {
  let conn = Sqlite.openDefault();
  const result = conn.execute("SELECT * FROM messages WHERE id = ?", [id]);
  if (!result) {
    throw new Error("Message not found.");
  }
  conn.execute("UPDATE messages SET message = ? WHERE id = ?", [
    newMessage,
    id,
  ]);
}
