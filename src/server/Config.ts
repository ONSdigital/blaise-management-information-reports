import crypto from "crypto";

import { type AuthConfig } from "blaise-login-react-server";

const DEFAULT_SESSION_TIMEOUT = "12h";
const DEFAULT_ROLES = ["DST", "BDSS", "TO Manager"];
const DEFAULT_PORT = 5000;

export interface Config extends AuthConfig {
  port: number;
  projectId: string;
  bertUrl: string;
  urlDomain: string;
  bertClientId: string;
  blaiseApiUrl: string;
  serverPark: string;
}

type RequiredConfigEnv = {
  PROJECT_ID: string | undefined;
  BERT_URL: string | undefined;
  URL_DOMAIN: string | undefined;
  BERT_CLIENT_ID: string | undefined;
  BLAISE_API_URL: string | undefined;
  SERVER_PARK: string | undefined;
};

type ResolvedRequiredConfigEnv = {
  [TKey in keyof RequiredConfigEnv]: string;
};

function sessionSecret(secret: string | undefined): string {
  if (!secret || secret === "" || secret === "_SESSION_SECRET") {
    return crypto.randomBytes(20).toString("hex");
  }

  return secret;
}

export function loadConfigFromEnv(): Config {
  const {
    PROJECT_ID,
    BERT_URL,
    URL_DOMAIN,
    BERT_CLIENT_ID,
    BLAISE_API_URL,
    SERVER_PARK,
    PORT,
    SESSION_SECRET,
  } = process.env;

  const requiredEnv: RequiredConfigEnv = {
    PROJECT_ID,
    BERT_URL,
    URL_DOMAIN,
    BERT_CLIENT_ID,
    BLAISE_API_URL,
    SERVER_PARK,
  };

  assertResolvedRequiredEnv(requiredEnv);

  return {
    port: parsePort(PORT),
    projectId: requiredEnv.PROJECT_ID,
    bertUrl: requiredEnv.BERT_URL,
    bertClientId: requiredEnv.BERT_CLIENT_ID,
    urlDomain: requiredEnv.URL_DOMAIN,
    blaiseApiUrl: requiredEnv.BLAISE_API_URL,
    TokenIssuer: requiredEnv.PROJECT_ID,
    Roles: DEFAULT_ROLES,
    SessionTimeout: DEFAULT_SESSION_TIMEOUT,
    serverPark: requiredEnv.SERVER_PARK,
    SessionSecret: sessionSecret(SESSION_SECRET),
  };
}

export function assertResolvedRequiredEnv(
  env: RequiredConfigEnv,
): asserts env is ResolvedRequiredConfigEnv {
  const missingEnv = Object.entries(env)
    .map(([name, value]) => {
      if (value === undefined || value.trim() === "" || value === `_${name}`) {
        return name;
      }

      return undefined;
    })
    .filter((name): name is string => name !== undefined);

  if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  }

  const malformedEnv = [validateUrlDomain(env.URL_DOMAIN)].filter(
    (errorMessage): errorMessage is string => errorMessage !== undefined,
  );

  if (malformedEnv.length > 0) {
    throw new Error(`Malformed environment variables: ${malformedEnv.join(", ")}`);
  }
}

function validateUrlDomain(urlDomain: string | undefined): string | undefined {
  if (urlDomain === undefined) {
    return "URL_DOMAIN";
  }

  if (urlDomain.includes("://") || urlDomain.includes("/") || /\s/.test(urlDomain)) {
    return "URL_DOMAIN";
  }

  try {
    const parsed = new URL(`https://${urlDomain}`);

    if (parsed.hostname !== urlDomain || parsed.pathname !== "/") {
      return "URL_DOMAIN";
    }
  } catch {
    return "URL_DOMAIN";
  }

  return undefined;
}

function parsePort(port: string | undefined): number {
  if (port === undefined) {
    return DEFAULT_PORT;
  }

  const parsed = Number(port);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${port}`);
  }

  return parsed;
}
