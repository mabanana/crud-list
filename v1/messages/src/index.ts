import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
  parseAuthorizationHeader,
  isUserAuth,
} from "./requestHandlers";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const method = request.method;
  const url = request.headers["spin-full-url"];
  const msgID = parseSlugFromURI(url, "messages");
  const auth = request.headers.authorization ?? null;
  const authID = parseAuthorizationHeader(auth);

  if (authID === null) {
    return { status: 400 };
  } else if (!(await isUserAuth(url, authID))) {
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
