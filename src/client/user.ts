import axios from "axios";
import { User } from "blaise-api-node-client";

export async function getUser(username: string): Promise<User> {
  const response = await axios.get(`/api/login/users/${username}`);

  return response.data;
}

export async function validatePassword(username: string, password: string): Promise<boolean> {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  const response = await axios.post("/api/login/users/password/validate", formData);

  return response.data;
}

export async function validateUserPermissions(username: string): Promise<[boolean, string | null]> {
  try {
    const response = await axios.get(`/api/login/users/${username}/authorised`);

    if (response.status === 200) {
      return [true, response.data.token];
    }
  } catch {
    return [false, null];
  }
  return [false, null];
}

export async function validateToken(token: string | null): Promise<boolean> {
  try {
    const response = await axios.post("/api/login/token/validate",
      { token: token }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.status === 200;
  } catch {
    return false;
  }
}
