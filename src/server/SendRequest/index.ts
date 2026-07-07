// Generic function to make requests to the API
import { Request, Response } from "express";
import axios, { AxiosRequestConfig } from "axios";
import * as PinoHttp from "pino-http";

type PromiseResponse = [number, any, string];

export default function SendAPIRequest(logger: PinoHttp.HttpLogger, req: Request, res: Response, url: string, method: AxiosRequestConfig["method"], data: any = null, headers: any = null): Promise<PromiseResponse> {
    logger(req, res);

    return new Promise((resolve: (object: PromiseResponse) => void) => {
        axios({
            url,
            method,
            data,
            headers,
            validateStatus(status) {
                return status >= 200;
            },
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                req.log.info(`Status ${response.status} from ${method} ${url}`);
            } else {
                req.log.warn(`Status ${response.status} from ${method} ${url}`);
            }
            let contentType = "";
            try {
                contentType = response.headers["content-type"];
            } finally {
                resolve([response.status, response.data, contentType]);
            }
        }).catch((error) => {
            req.log.error(error, `${method} ${url} endpoint failed`);
            resolve([500, null, ""]);
        });
    });
}
