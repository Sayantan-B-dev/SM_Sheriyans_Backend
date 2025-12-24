import * as hello from "./hello.js";
import * as time from "./time.js";
import * as fsTool from "./fs.js";

const tools = [hello, time, fsTool];

export function listTools() {
  return tools.map(t => t.definition);
}

export async function runTool(name, args) {
  const tool = tools.find(t => t.definition.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.run(args);
}
