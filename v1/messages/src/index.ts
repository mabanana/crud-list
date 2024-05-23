import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk";
import {
  handleGetRequest,
  handlePostRequest,
  handleDeleteRequest,
  handlePutRequest,
  parseSlugFromURI,
  MessagePayload,
  parseAuthorizationHeader,
  parseHostname,
  isUserAuth,
} from "./requestHandlers";

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  const method = request.method;
  const uri = request.uri;
  const msgID = parseSlugFromURI(uri, "messages");
  const auth = request.headers.authorization ?? undefined;
  const authID = parseAuthorizationHeader(auth);
  const url = request.headers["spin-full-url"];
  const host = parseHostname(url);

  if (!(await isUserAuth(host, authID))) {
    return { status: 401 };
  }

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

  return { status: 400 };
};
