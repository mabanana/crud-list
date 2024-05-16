import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
} from "./requestHandlers";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const method = request.method;
  const uri = request.uri;
  const msgID = parseSlugFromURI(uri, "messages");

  if (method == "GET") {
    return handleGetRequest(msgID);
  } else if (method == "DELETE") {
    return handleDeleteRequest(msgID);
  } else if (method == "POST") {
    const requestBody = request.json() as MessagePayload;
    if (requestBody.message == undefined) {
      return { status: 400 };
    }
    return handlePostRequest(requestBody.message);
  } else if (method == "PUT") {
    const requestBody = request.json() as MessagePayload;
    if (requestBody.message == undefined) {
      return { status: 400 };
    }
    return handlePutRequest(requestBody.message, msgID);
  }

  return {
    status: 400,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body: "Invalid request!" }),
  };
};
