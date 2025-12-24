export const definition = {
  name: "hello",
  description: "Say hello to a person",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" }
    },
    required: ["name"]
  }
};

export async function run(args) {
  return {
    content: [
      {
        type: "text",
        text: `Hello ${args.name}`
      }
    ]
  };
}
