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
  const url = request.headers["spin-full-url"];
  const userID = parseSlugFromURI(url, "users");

  if (method === "GET") {
    return handleGetRequest(userID);
  } else if (method === "DELETE") {
    return handleDeleteRequest(userID);
  } else if (method === "POST") {
    return handlePostRequest(request.json() as MessagePayload);
  } else if (method === "PUT") {
    return handlePutRequest(request.json() as MessagePayload, userID);
  }

  return { status: 400 };
};
