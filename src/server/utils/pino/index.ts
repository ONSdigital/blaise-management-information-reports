import { type HttpLogger, type Options, pinoHttp } from "pino-http";

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const PinoLevelToSeverityLookup = {
    trace: "DEBUG",
    debug: "DEBUG",
    info: "INFO",
    warn: "WARNING",
    error: "ERROR",
    fatal: "CRITICAL",
};

const defaultPinoConf = {
    messageKey: "message",
    formatters: {
        level(label: unknown, number: unknown) {
            return {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                severity: PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup.info,
                level: number,
            };
        },
        log(info: never) {
            return { info };
        },
    },
    serializers: {
        req: (req: unknown) => {
            const request = req as {
                method?: string;
                url?: string;
                raw?: { user?: unknown };
            };

            return {
                method: request.method,
                url: request.url,
                user: request.raw?.user,
            };
        },
    },
};

export default function createLogger(options: Options = { autoLogging: false }): HttpLogger {
    let pinoConfig = {};

    if (process.env.NODE_ENV === "production") {
        pinoConfig = defaultPinoConf;
    }

    return pinoHttp({ ...options, ...pinoConfig });
}