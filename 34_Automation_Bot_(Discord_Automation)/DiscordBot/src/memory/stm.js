const STM_LIMIT = 6;
const stm = new Map();

function getSTM(userId) {
  return stm.get(userId) || [];
}

function addSTM(userId, message) {
  const history = getSTM(userId);
  history.push(message);

  // keep last N messages only
  if (history.length > STM_LIMIT) {
    history.splice(0, history.length - STM_LIMIT);
  }

  stm.set(userId, history);
}
async function fetchDiscordSTM(message, limit = 10) {
  const fetched = await message.channel.messages.fetch({ limit });

  // oldest → newest
  const ordered = [...fetched.values()].reverse();

  const stm = [];

  for (const msg of ordered) {
    if (msg.author.bot && msg.author.id === message.client.user.id) {
      stm.push({ role: "assistant", content: msg.content });
    } 
    else if (msg.author.id === message.author.id) {
      stm.push({ role: "user", content: msg.content });
    }
  }

  return stm;
}

module.exports = {
  getSTM,
  addSTM,
  fetchDiscordSTM
};
