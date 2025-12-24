function splitMessage(text, maxLength = 2000) {
  const chunks = [];
  let current = "";

  for (const line of text.split("\n")) {
    if ((current + line + "\n").length > maxLength) {
      chunks.push(current);
      current = "";
    }
    current += line + "\n";
  }

  if (current) chunks.push(current);
  return chunks;
}
module.exports={splitMessage}