export const definition = {
  name: "time",
  description: "Get current system time",
  inputSchema: {
    type: "object",
    properties: {}
  }
};

export async function run() {
  return {
    content: [
      {
        type: "text",
        text: new Date().toISOString()
      }
    ]
  };
}
