import {
  HandleRequest,
  HttpRequest,
  HttpResponse,
  Sqlite,
} from "@fermyon/spin-sdk";

interface MessagePayload {
  message: string;
  id: number;
  token: string;
}

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const method = request.method;
  const requestBody = request.json() as MessagePayload;

  if (method == "GET") {
    let conn = Sqlite.openDefault();
    let table = await conn.execute("SELECT * FROM messages", []);
    console.log(table);
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(table),
    };
  } else if (method == "POST") {
    let conn = Sqlite.openDefault();
    let message = requestBody.message;
    let id = Date.now();
    await conn.execute("INSERT INTO messages (id, message) VALUES (?,?)", [
      id,
      message,
    ]);

    return {
      status: 200,
      headers: { "content-type": "text/plain" },
      body: "Message added",
    };
  } else if (method == "DELETE") {
    let conn = Sqlite.openDefault();
    let id = requestBody.id;
    await conn.execute("DELETE FROM messages WHERE id = ?", [id]);

    return {
      status: 200,
      headers: { "content-type": "text/plain" },
      body: "Message deleted",
    };
  } else if (method == "PUT") {
    let conn = Sqlite.openDefault();
    let id = requestBody.id;
    let newMessage = requestBody.message;
    await conn.execute("UPDATE messages SET message = ? WHERE id = ?", [
      newMessage,
      id,
    ]);

    let success = await conn.execute("SELECT * FROM messages WHERE id = ?", [
      id,
    ]);

    if (success)
      return {
        status: 200,
        headers: { "content-type": "text/plain" },
        body: "Message updated",
      };
    else
      return {
        status: 404,
        headers: { "content-type": "text/plain" },
        body: "Message not found",
      };
  }

  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body: "Hello from TS-SDK",
  };
};
