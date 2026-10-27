import { createServer } from "node:http";
import { handle } from "./handler";
createServer(async (req, res) => {
  let text = "";
  try {
    for await (const chunk of req) {
      text += chunk;
      if (text.length > 32768) throw new Error("Body too large");
    }
    const body: unknown = text ? JSON.parse(text) : undefined;
    const url = new URL(req.url ?? "/", "http://localhost");
    const result = handle(
      req.method ?? "GET",
      url.pathname,
      body,
      url.searchParams,
    );
    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid request body" }));
  }
}).listen(3001, "127.0.0.1");
