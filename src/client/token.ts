import Cookies from "universal-cookie";
import { validateToken } from "./user";

const sessionKey = "blaise-user";

export class AuthManager {
  cookies: Cookies

  constructor() {
    this.cookies = new Cookies();

    this.getToken = this.getToken.bind(this);
    this.setToken = this.setToken.bind(this);
    this.clearToken = this.clearToken.bind(this);
    this.authHeader = this.authHeader.bind(this);
    this.cookieSettings = this.cookieSettings.bind(this);
    this.loggedIn = this.loggedIn.bind(this);
  }

  getToken(): string | null {
    return this.cookies.get(sessionKey, this.cookieSettings());
  }

  setToken(token: string | null): void {
    this.cookies.set(sessionKey, token, this.cookieSettings());
  }

  clearToken(): void {
    if (this.setToken) {
      this.setToken(null);
    }
    this.cookies.set(sessionKey, null, { maxAge: -1 });
    this.cookies.remove(sessionKey, this.cookieSettings());
  }

  async loggedIn(): Promise<boolean> {
    return validateToken(this.getToken()).then((validated: boolean) => {
      return validated;
    }).catch((error: unknown) => {
      console.log(`Error checking logged in state: ${error}`);
      return false;
    });
  }

  authHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      return {};
    }

    return {
      authorization: token
    };
  }

  cookieSettings(): any {
    const host = window.location.hostname;
    const domain = host.substring(host.indexOf(".") + 1);
    console.log(domain);
    const secure = window.location.protocol === "https://";
    return {
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours
      domain: domain,
      secure: secure,
      sameSite: "strict",
    };
  }
}
