import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd(); // sandbox root

export const definition = {
  name: "read_file",
  description: "Read a text file from the project directory",
  inputSchema: {
    type: "object",
    properties: {
      filepath: { type: "string" }
    },
    required: ["filepath"]
  }
};

export async function run({ filepath }) {
  const resolved = path.resolve(ROOT, filepath);

  if (!resolved.startsWith(ROOT)) {
    throw new Error("Access denied");
  }

  const data = await fs.readFile(resolved, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: data
      }
    ]
  };
}
