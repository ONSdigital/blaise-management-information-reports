// Generic function to make requests to the API
import axios from "axios";

import type { AxiosRequestConfig } from "axios";
import type { Request, Response } from "express";
import type * as PinoHttp from "pino-http";

type PromiseResponse = [number, unknown, string];

export default function SendAPIRequest(
  logger: PinoHttp.HttpLogger,
  req: Request,
  res: Response,
  url: string,
  method: AxiosRequestConfig["method"],
  data: unknown = null,
): Promise<PromiseResponse> {
  logger(req, res);
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve: (object: PromiseResponse) => void) => {
    axios({
      url,
      method,
      data,
      headers: config.headers,
      validateStatus(status) {
        return status >= 200;
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          req.log.info(`Status ${response.status} from ${method} ${url}`);
        } else {
          req.log.warn(`Status ${response.status} from ${method} ${url}`);
        }

        let contentType = "";

        try {
          const headerValue = response.headers["content-type"];

          contentType = headerValue == null ? "" : String(headerValue);
        } finally {
          resolve([response.status, response.data, contentType]);
        }
      })
      .catch((error) => {
        req.log.error(error, `${method} ${url} endpoint failed`);
        resolve([500, null, ""]);
      });
  });
}
