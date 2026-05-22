import axios from "axios";

export const fireToFastAPI = async (
  method: "POST" | "DELETE",
  path: string,
  body: any = null
) => {
  try {
    const url = `${process.env.FASTAPI_URL}${path}`;

    if (method === "DELETE") {
      await axios.delete(url);
    } else {
      await axios.post(url, body);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FastAPI] ${method} ${path} failed:`, message);
  }
};
