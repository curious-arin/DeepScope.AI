async function post(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(typeof data.detail === "string" ? data.detail : "Something went wrong.");
    error.status = res.status;
    throw error;
  }
  return data;
}
export const login = (credentials) => post("login", credentials);
export const logout = (token) => post("logout", { token });
export const runStep = (step, token, payload) => post(step, { token, ...payload });
