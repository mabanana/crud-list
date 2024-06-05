import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
  isUserAuth,
} from "./requestHandlers";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const msgID = parseSlugFromURI(request.headers);
  const method = request.method;
  if (!(await isUserAuth(request.headers))) {
    return { status: 401 };
  }
  if (method === "GET") {
    return handleGetRequest(msgID);
  } else if (method === "DELETE") {
    return handleDeleteRequest(msgID);
  } else if (method === "POST") {
    return handlePostRequest(request.json() as MessagePayload);
  } else if (method === "PUT") {
    return handlePutRequest(request.json() as MessagePayload, msgID);
  }

  return { status: 400 };
};
