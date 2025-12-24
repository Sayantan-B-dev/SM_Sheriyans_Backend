import { ToolCallSchema } from "./schemas.js";
import { listTools, runTool } from "./tools/index.js";

process.stdin.on("data", async (chunk) => {
  let message;

  try {
    message = JSON.parse(chunk.toString());
  } catch {
    return;
  }

  try {
    if (message.method === "tools/list") {
      respond(message.id, listTools());
      return;
    }

    if (message.method === "tools/call") {
      const { name, arguments: args } = ToolCallSchema.parse(message.params);
      const result = await runTool(name, args);
      respond(message.id, result);
      return;
    }

    respond(message.id, {
      error: `Unknown method: ${message.method}`
    });

  } catch (err) {
    respond(message.id ?? null, {
      error: err.message
    });
  }
});

function respond(id, result) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      result
    }) + "\n"
  );
}
