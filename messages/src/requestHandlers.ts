import { HttpRequest, HttpResponse, Sqlite } from "@fermyon/spin-sdk";

interface MessagePayload {
  message: string;
  token: string;
}

async function handleGetRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  let table: any;

  if (msgID != "") {
    if (ifExists(conn, msgID) == false) {
      return { status: 404 };
    }
    table = await conn.execute("SELECT * FROM messages WHERE id = ?", [msgID]);
  } else {
    table = await conn.execute("SELECT * FROM messages", []);
  }

  const rows = tableToRows(table);

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(rows),
  };
}

async function handlePostRequest(request: HttpRequest): Promise<HttpResponse> {
  const requestBody = request.json() as MessagePayload;
  const conn = Sqlite.openDefault();
  const message = requestBody.message;
  const id = Date.now();
  const createdAt = new Date().toISOString();

  await conn.execute("INSERT INTO messages (id, message) VALUES (?,?)", [
    id,
    message,
  ]);

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message_id: id,
      createdAt: createdAt,
      message: message,
    }),
  };
}

async function handleDeleteRequest(msgID: string): Promise<HttpResponse> {
  const conn = Sqlite.openDefault();
  const id = msgID;

  if (ifExists(conn, id) == false) {
    return { status: 404 };
  }

  await conn.execute("DELETE FROM messages WHERE id = ?", [id]);

  return { status: 200 };
}

async function handlePutRequest(
  request: HttpRequest,
  msgID: string
): Promise<HttpResponse> {
  const requestBody = request.json() as MessagePayload;
  const conn = Sqlite.openDefault();
  const id = msgID;
  const newMessage = requestBody.message;

  if (ifExists(conn, id) == false) {
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
  if (uri[uri.length - 1] != "/") {
    uri = uri + "/";
  }
  const uriParts = uri.split("/");
  const resourceIndex = uriParts.indexOf(resource);
  if (resourceIndex == uriParts.length - 1) {
    return "";
  }
  return uriParts[resourceIndex + 1];
}

function tableToRows(table: any): any[] {
  let rows: any[] = new Array(table.rows.length);

  for (let i = 0; i < table.rows.length; i++) {
    rows[i] = table.rows[i].id + " : " + table.rows[i].message;
  }

  return rows;
}

export {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  tableToRows,
  ifExists,
};
