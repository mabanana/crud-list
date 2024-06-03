import { HttpResponse, Sqlite } from "@fermyon/spin-sdk";

interface MessagePayload {
  message: string;
  token: string;
}
const validURLCharacters = /^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]*$/;

async function handleGetRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  let table: any;

  if (msgID != "") {
    if (ifExists(conn, msgID) === false) {
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

async function handlePostRequest(message: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  const id = Date.now();
  const createdAt = new Date().toISOString();

  await conn.execute("CREATE TABLE IF NOT EXISTS messages (id, message)", []);

  await conn.execute("INSERT INTO messages (id, message) VALUES (?,?)", [
    id,
    message,
  ]);

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messageId: id,
      createdAt: createdAt,
      message: message,
    }),
  };
}

async function handleDeleteRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  const id = msgID;

  if (ifExists(conn, id) === false) {
    return { status: 404 };
  }

  await conn.execute("DELETE FROM messages WHERE id = ?", [id]);

  return { status: 200 };
}

async function handlePutRequest(
  newMessage: string,
  msgID: string
): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  const id = msgID;

  if (ifExists(conn, id) === false) {
    return { status: 404 };
  }

  await conn.execute("UPDATE messages SET message = ? WHERE id = ?", [
    newMessage,
    id,
  ]);

  return { status: 200 };
}

function ifExists(conn: any, id: string): boolean {
  const table = conn.execute("SELECT * FROM messages WHERE id = ?", [id]);
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

function parseAuthorizationHeader(auth: string): string | null {
  if (auth === undefined) {
    return null;
  }
  if (auth.startsWith("Basic ")) {
    let authID = auth.substring(6);

    if (!validURLCharacters.test(authID)) {
      return null;
    }
    return authID;
  }
  return null;
}

async function isUserAuth(
  host: string,
  authID: string | null
): Promise<boolean> {
  if (authID === null || authID === "") {
    return false;
  }
  const response = await fetch(host + "users/" + authID, {
    method: "GET",
  });
  return response.status === 200;
}

function parseHostname(url: string): string {
  const componentName = "messages";
  return url.substring(0, url.indexOf(componentName));
}

export {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  parseAuthorizationHeader,
  MessagePayload,
  isUserAuth,
  parseHostname,
};
