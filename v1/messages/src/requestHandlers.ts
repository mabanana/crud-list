import { HttpResponse, Sqlite } from "@fermyon/spin-sdk";

interface MessagePayload {
  message: string;
  token: string;
}
const digitOnlyRegex = /^\d+$/;
const COMPONENT_NAME = "messages";

async function handleGetRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  let table: any;

  if (msgID != "") {
    if (!ifExists(conn, msgID)) {
      return { status: 404 };
    }
    table = await conn.execute("SELECT * FROM messages WHERE id = ?", [msgID]);
  } else {
    table = await conn.execute("SELECT * FROM messages", []);
  }

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(table.rows),
  };
}

async function handlePostRequest(
  requestBody: MessagePayload
): Promise<HttpResponse> {
  if (requestBody.message === undefined) {
    return { status: 400 };
  }
  const conn = Sqlite.openDefault();
  const id = Date.now();
  const createdAt = new Date().toISOString();

  await conn.execute("CREATE TABLE IF NOT EXISTS messages (id, message)", []);

  await conn.execute("INSERT INTO messages (id, message) VALUES (?,?)", [
    id,
    requestBody.message,
  ]);

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messageId: id,
      createdAt: createdAt,
      message: requestBody.message,
    }),
  };
}

async function handleDeleteRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();

  if (!ifExists(conn, msgID)) {
    return { status: 404 };
  }

  await conn.execute("DELETE FROM messages WHERE id = ?", [msgID]);

  return { status: 200 };
}

async function handlePutRequest(
  requestBody: MessagePayload,
  msgID: string
): Promise<HttpResponse> {
  if (requestBody.message === undefined) {
    return { status: 400 };
  }
  const conn = Sqlite.openDefault();

  if (!ifExists(conn, msgID)) {
    return { status: 404 };
  }

  await conn.execute("UPDATE messages SET message = ? WHERE id = ?", [
    requestBody.message,
    msgID,
  ]);

  return { status: 200 };
}

function ifExists(conn: any, id: string): boolean {
  return (
    conn.execute("SELECT * FROM messages WHERE id = ?", [id]).rows.length > 0
  );
}

function parseSlugFromURI(headers: Record<string, string>): string {
  const urlParts = headers["spin-full-url"].split("/");
  const resourceIndex = urlParts.indexOf(COMPONENT_NAME);

  if (resourceIndex != -1) {
    const msgID = urlParts[resourceIndex + 1] ?? "";
    if (msgID.length > 0) {
      return msgID;
    }
  }
  return "";
}

function parseUserID(headers: Record<string, string>): string | null {
  const auth = headers["authorization"] ?? null;
  if (auth === null) {
    return null;
  }
  if (auth.startsWith("Basic ")) {
    let authID = auth.substring(6);

    if (!digitOnlyRegex.test(authID)) {
      return null;
    }
    return authID;
  }
  return null;
}

async function isUserAuth(headers: Record<string, string>): Promise<boolean> {
  const url = headers["spin-full-url"];
  const authID = parseUserID(headers);

  if (authID === null || authID === "") {
    return false;
  }
  const host = url.substring(0, url.indexOf(COMPONENT_NAME));
  const response = await fetch(host + "users/" + authID, {
    method: "GET",
  });
  return response.status === 200;
}

export {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
  isUserAuth,
};
