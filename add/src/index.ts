import {
  HandleRequest,
  HttpRequest,
  HttpResponse,
  Sqlite,
} from "@fermyon/spin-sdk";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const request_body: any = request.json();
  const message = request_body.message;

  if (message === undefined) {
    return {
      status: 200,
      headers: { "content-type": "text/plain" },
      body: "No Message Found.",
    };
  }
  console.log("Message: ", message);
  let conn = Sqlite.openDefault();
  conn.execute(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, message TEXT)",
    []
  );

  let id = Date.now();
  conn.execute("INSERT INTO messages (id, message) VALUES (?, ?)", [
    id,
    message,
  ]);

  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body: "Message Added Successfully.",
  };
};
