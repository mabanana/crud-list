import { HttpResponse, Sqlite } from "@fermyon/spin-sdk";

interface MessagePayload {
  username: string;
  token: string;
}

async function handleGetRequest(userID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  let table: any;

  if (userID != "") {
    if (ifExists(conn, userID) == false) {
      return { status: 404 };
    }
    table = await conn.execute("SELECT * FROM users WHERE id = ?", [userID]);
  } else {
    table = await conn.execute("SELECT * FROM users", []);
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
  if (requestBody.username === undefined) {
    return { status: 400 };
  }
  const conn = Sqlite.openDefault();
  const id = Date.now();
  const createdAt = new Date().toISOString();

  await conn.execute(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT
    )`,
    []
  );

  if (ifUserExists(conn, requestBody.username)) {
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        errorCode: "1",
      }),
    };
  }

  await conn.execute("INSERT INTO users (id, username) VALUES (?,?)", [
    id,
    requestBody.username,
  ]);

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      usernameId: id,
      createdAt: createdAt,
      username: requestBody.username,
    }),
  };
}

async function handleDeleteRequest(userID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  const id = userID;

  if (ifExists(conn, id) == false) {
    return { status: 404 };
  }

  await conn.execute("DELETE FROM users WHERE id = ?", [id]);

  return { status: 200 };
}

async function handlePutRequest(
  requestBody: MessagePayload,
  msgID: string
): Promise<HttpResponse> {
  if (requestBody.username === undefined) {
    return { status: 400 };
  }
  const conn = Sqlite.openDefault();
  const id = msgID;

  if (ifExists(conn, id) == false) {
    return { status: 404 };
  }
  if (ifUserExists(conn, requestBody.username)) {
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        errorCode: "1",
      }),
    };
  }

  await conn.execute("UPDATE users SET username = ? WHERE id = ?", [
    requestBody.username,
    id,
  ]);

  return { status: 200 };
}

function ifExists(conn: any, id: string): boolean {
  const table = conn.execute("SELECT * FROM users WHERE id = ?", [id]);
  return table.rows.length > 0;
}

function ifUserExists(conn: any, username: string): boolean {
  const table = conn.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return table.rows.length > 0;
}

function parseSlugFromURI(uri: string, resource: string): string {
  const uriParts = uri.split("/");
  const resourceIndex = uriParts.indexOf(resource);

  if (resourceIndex != -1) {
    const msgID = uriParts[resourceIndex + 1] ?? "";
    if (msgID.length > 0) {
      return msgID;
    }
  }
  return "";
}

export {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
};
