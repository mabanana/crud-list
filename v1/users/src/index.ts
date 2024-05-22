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
  const userID = parseSlugFromURI(uri, "users");

  if (method == "GET") {
    return handleGetRequest(userID);
  } else if (method == "DELETE") {
    return handleDeleteRequest(userID);
  } else if (method == "POST") {
    const requestBody = request.json() as MessagePayload;
    if (requestBody.username == undefined) {
      return { status: 400 };
    }
    return handlePostRequest(requestBody.username);
  } else if (method == "PUT") {
    const requestBody = request.json() as MessagePayload;
    if (requestBody.username == undefined) {
      return { status: 400 };
    }
    return handlePutRequest(requestBody.username, userID);
  }

  return { status: 400 };
};
