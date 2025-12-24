# 1 — install & environment

* Correct package name: `discord.js` (not `discord.j`).

  ```bash
  npm i discord.js
  ```
* Use Node 18+ (recommended) and a recent discord.js v14.x for `GatewayIntentBits`, `PermissionsBitField`, new builders, and slash command helpers.
* Store secrets (bot token) in `.env` and load via `require('dotenv').config()` so you never commit tokens to Git.

`.env` example (do **not** commit):

```
DISCORD_BOT_TOKEN=your_token_here
```

---

# 2 — Discord Developer Portal (high level)

Steps to get your bot running:

1. Go to Developer Portal → Applications → New Application.
2. In the application, add a **Bot** (Bot tab → Add Bot).
3. Copy the **Bot Token** and store it in `.env`. If leaked, regenerate token.
4. Under **OAuth2 > URL Generator** select scopes: `bot` and `applications.commands` as needed, and pick permission bits (or use `permissions` integer). Or generate programmatically.
5. If you request privileged intents (Message Content, Guild Members, Presence), enable them in the Bot settings (toggle privileged intents).
6. Invite the bot using OAuth2 URL or `client.generateInvite()` in code.

Invite URL example (replace `CLIENT_ID`):

```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot%20applications.commands&permissions=8
```

`permissions=8` grants ADMINISTRATOR. Only use that if you truly need it.

---

# 3 — Gateway Intents (what they are; why they exist)

Gateway Intents control what events/data Discord will send your bot over the websocket gateway. You request them when creating the `Client`.

* Intents reduce unnecessary traffic and protect privacy (Message Content is privileged).
* Always request the minimum intents your bot needs.

Common intents (discord.js `GatewayIntentBits` enum; numeric values you may see):

* `GatewayIntentBits.Guilds` — basic guild events (create, delete, updates). Numeric value: `1`.
* `GatewayIntentBits.GuildMembers` — member join/leave/update events (privileged).
* `GatewayIntentBits.GuildMessages` — `messageCreate` for messages in guild text channels. Numeric value: `512`.
* `GatewayIntentBits.MessageContent` — allows your bot to read `message.content`. **Privileged**. Numeric value: `32768`.
* `GatewayIntentBits.DirectMessages` — receive DMs (private messages).
* `GatewayIntentBits.GuildMessageReactions` — reaction add/remove events.
* (There are others — use `GatewayIntentBits` in code instead of hard-coded numbers.)

**Rule of thumb:** For command-style behavior, prefer slash commands (`applications.commands`) and `interactionCreate`, which usually avoid the privileged `MessageContent` requirement.

---

# 4 — Permissions vs Intents vs Scopes (short)

* **Intents** — gateway level; decide which events your bot receives.
* **Permissions** — what the bot can do inside a guild: ban, kick, manage messages, etc. Represented by a bitfield integer (e.g., `8` = `ADMINISTRATOR`).
* **OAuth2 scopes** — `bot` (invite) and `applications.commands` (slash commands). Used in the OAuth2 invite URL.

Use `PermissionsBitField.Flags` (discord.js) to refer to permission names rather than raw numbers.

Example: build an invite with minimal permissions:

```js
const { PermissionsBitField } = require('discord.js');
const perms = PermissionsBitField.Flags.SendMessages | PermissionsBitField.Flags.EmbedLinks;
const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot%20applications.commands&permissions=${perms}`;
```

---

# 5 — Error: “Used disallowed intents”

If you include privileged intents in your client (e.g., `MessageContent`) but haven’t enabled them in the Developer Portal, Discord will refuse and you’ll see errors like `Used disallowed intents` or `PrivilegedIntentsRequired`.

Fix:

1. Go to Developer Portal → Application → Bot tab.
2. Enable the privileged intents you need (Message content, Server members, Presence).
3. Save changes.
4. If your bot is in many guilds (threshold historically 75+, check current portal), you may also need to verify the bot to keep privileged intents.

**Recommendation:** Use slash commands/interaction-based flows where possible to avoid requiring `MessageContent`.

---

# 6 — Your snippet: annotated walkthrough (line-by-line)

You posted this snippet. I’ll annotate & correct.

```js
require("dotenv").config()
const { generateResponse } = require("./src/services/groq.service")
const { splitMessage } = require("./src/helper/splitMessage")
const { getSTM, addSTM, fetchDiscordSTM } = require("./src/memory/stm");

const { Client, GatewayIntentBits } = require("discord.js")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.once("clientReady", () => {
    console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    try {
        const userId = message.author.id;

        const stmData = getSTM(userId);
        let history = stmData.history;
        if (!history || history.length === 0) {
            history = await fetchDiscordSTM(message, 12);
        }

        const messages = [
            ...history,
            { role: "user", content: message.content }
        ];

        const response = await generateResponse(messages);

        addSTM(userId, { role: "user", content: message.content });
        addSTM(userId, { role: "assistant", content: response });

        const parts = splitMessage(response);

        for (const part of parts) {
            await message.channel.send(part);
        }
    } catch (err) {
        console.error("Message handler error:", err);
    }
})

process.on("unhandledRejection", console.error);
client.on("error", console.error);

client.login(process.env.DISCORD_BOT_TOKEN)
```

### Problems & corrections

1. `client.once("clientReady", ...)` — wrong event name. Use `client.once("ready", ...)`.
2. `require("dotenv").config()` — good. Ensure `.env` exists.
3. `getSTM` returns `stmData` — you assume `stmData.history` exists; ensure `getSTM` returns a well-defined object or `[]`.
4. `fetchDiscordSTM(message, 12)` — good idea to pull recent context from the channel, but be careful about rate limits and message content privileges. `fetch` requires `GuildMessages`/`MessageContent` or access to the channel messages.
5. Sending multiple `message.channel.send(part)` without throttling may lead to rate-limit 429 responses — use a small delay or queue.
6. No `message.channel.sendTyping()` to indicate the bot is thinking.
7. No timeout for `generateResponse` — model calls can hang; add a timeout and fallback.
8. No validation of `message.content` (e.g., length, dangerous content). Sanitize depending on your model.

---

# 7 — Corrected & improved full bot example

This is a corrected, robust version of your logic, including:

* `ready` event
* `sendTyping`
* `generateResponse` wrapper with timeout
* `splitMessage` usage
* safe STM
* `fetchDiscordSTM` implemented
* queueing to avoid rate limits

You can adapt this to your codebase.

```js
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { generateResponseWithTimeout } = require('./src/services/groq.service'); // see wrapper example below
const { splitMessage } = require('./src/helper/splitMessage');
const { getSTM, addSTM, fetchDiscordSTM } = require('./src/memory/stm');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // Only include if you enabled it in the portal and you truly need it:
    GatewayIntentBits.MessageContent,
  ]
});

client.once('ready', () => {
  console.log(`Bot ready — ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    await message.channel.sendTyping();

    const userId = message.author.id;

    // Attempt to get STM; if empty, fetch from the channel
    const stmData = getSTM(userId) || { history: [] };
    let history = Array.isArray(stmData.history) ? stmData.history : [];
    if (!history || history.length === 0) {
      history = await fetchDiscordSTM(message, 12); // fetch last 12 relevant messages
    }

    const messages = [...history, { role: 'user', content: message.content }];

    const response = await generateResponseWithTimeout(messages, { timeoutMs: 20000 });

    // Save to short-term memory
    addSTM(userId, { role: 'user', content: message.content });
    addSTM(userId, { role: 'assistant', content: response });

    const parts = splitMessage(response);

    // Throttled send to reduce 429 risk
    for (const part of parts) {
      await new Promise((r) => setTimeout(r, 250)); // small throttle
      await message.channel.send(part);
    }
  } catch (err) {
    console.error('Message handler error:', err);
    try {
      await message.reply("Sorry, I couldn't process that right now.");
    } catch {}
  }
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
client.on('error', (err) => {
  console.error('Client error:', err);
});

client.login(process.env.DISCORD_BOT_TOKEN);
```

---

# 8 — Implementations for your helper functions

Below are ready-to-use implementations you can place in `src/memory/stm.js` and `src/helper/splitMessage.js` and a `generateResponseWithTimeout` wrapper. Adapt to your style.

### `src/memory/stm.js` — in-memory STM + fetchDiscordSTM

```js
// src/memory/stm.js
const MAX_HISTORY = 12;
const memory = new Map(); // userId -> [{role, content}, ...]

function getSTM(userId) {
  // Return an object for compatibility with your code that expected { history: [...] }
  const history = memory.get(userId) ?? [];
  return { history };
}

function addSTM(userId, message) {
  const arr = memory.get(userId) ?? [];
  arr.push(message);
  // keep only the last MAX_HISTORY messages
  if (arr.length > MAX_HISTORY) arr.splice(0, arr.length - MAX_HISTORY);
  memory.set(userId, arr);
  return getSTM(userId);
}

/**
 * fetchDiscordSTM(message, limit)
 * - message: the discord.js Message object that triggered the handler
 * - limit: number of recent messages to fetch (max 100 per API call)
 * Returns an array of { role, content } ordered oldest->newest
 */
async function fetchDiscordSTM(triggerMessage, limit = 12) {
  // If MessageContent intent is not enabled, message fetching may not include content
  const channel = triggerMessage.channel;
  let fetched;
  try {
    // fetch returns messages in reverse chronological order
    fetched = await channel.messages.fetch({ limit: Math.min(limit, 100) });
  } catch (err) {
    console.error('fetchDiscordSTM: unable to fetch messages', err);
    return [];
  }

  // Convert to array and order oldest -> newest
  const arr = Array.from(fetched.values()).reverse();

  // Convert to role/content pairs, excluding bot messages and the trigger itself if desired
  const pairs = arr
    .filter((m) => !m.author.bot) // ignore bots
    .map((m) => {
      return { role: m.author.id === triggerMessage.client.user.id ? 'assistant' : 'user', content: m.content };
    });
  // Keep the last `limit` items
  return pairs.slice(-limit);
}

module.exports = { getSTM, addSTM, fetchDiscordSTM };
```

**Notes**

* This is ephemeral (lost on restart). If you want persistence use Redis, SQLite, Postgres.
* Keep a bounded history to avoid exploding token usage when calling LLMs.

---

### `src/helper/splitMessage.js` — robust splitter with code block handling

Discord message limit: ~2000 characters. This splitter tries to preserve triple-backtick code fences.

````js
// src/helper/splitMessage.js
const MAX_LEN = 2000;

function splitMessage(text, maxLen = MAX_LEN) {
  if (!text) return [];

  // Fast path
  if (text.length <= maxLen) return [text];

  const parts = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    // take a candidate slice
    let slice = remaining.slice(0, maxLen);

    // prefer split at last newline in slice
    const lastNewline = slice.lastIndexOf('\n');
    let splitIndex = lastNewline > 0 ? lastNewline : maxLen;

    // But handle unbalanced triple backticks:
    const opens = (slice.match(/```/g) || []).length;
    if (opens % 2 === 1) {
      // odd number of ``` in slice => code block started but not closed inside slice
      // try to find the next closing ``` in remaining
      const closingIndex = remaining.indexOf('```', maxLen);
      if (closingIndex !== -1) {
        // extend the slice to include the closing ```
        splitIndex = closingIndex + 3;
      } else {
        // no closing fence found — to avoid a huge message, close the fence ourselves
        slice = slice + '\n```';
        parts.push(slice);
        remaining = remaining.slice(maxLen);
        continue;
      }
    }

    parts.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trim();
  }

  if (remaining.length) parts.push(remaining);
  return parts;
}

module.exports = { splitMessage };
````

This is a reasonably robust splitter. For production, consider a fuller implementation that also preserves inline code, markdown boundaries, and ensures code fences retain the language tag.

---

### `generateResponseWithTimeout` — wrapper (example)

This wraps your `generateResponse` call so it times out and gives a fallback.

```js
// src/services/groq.service.js (example wrapper)
const { generateResponse } = require('./groq_core'); // your actual function calling API

async function generateResponseWithTimeout(messages, { timeoutMs = 20000 } = {}) {
  // Simple Promise.race timeout wrapper
  const resultPromise = generateResponse(messages); // your existing function
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('generateResponse timed out')), timeoutMs));
  return Promise.race([resultPromise, timeoutPromise]);
}

module.exports = { generateResponseWithTimeout };
```

If your underlying library supports AbortController or timeouts, use that instead. Always handle network errors and return user-friendly messages on failure.

---

# 9 — Rate limits & safe sending patterns

* Discord rate-limits heavily. To avoid `429`:

  * Throttle multi-message sends (e.g., 100–300ms delay between messages).
  * Use `channel.sendTyping()` to signal work in progress.
  * Implement a per-channel send queue if many messages come in concurrently.
  * Catch `DiscordAPIError: 429` and respect the `retry_after` header (discord.js does some of this for you, but be careful with bulk operations).

Simple send queue pattern:

```js
const channelQueues = new Map();

async function enqueueChannelSend(channel, text) {
  if (!channelQueues.has(channel.id)) channelQueues.set(channel.id, []);
  const q = channelQueues.get(channel.id);
  q.push(text);
  if (q._running) return;
  q._running = true;
  while (q.length) {
    const item = q.shift();
    try {
      await channel.send(item);
      await new Promise(r => setTimeout(r, 200)); // throttle
    } catch (err) {
      console.error('send error', err);
      // push back or drop depending on error type
    }
  }
  q._running = false;
}
```

---

# 10 — Useful discord.js functions & quick examples

### Events

* `client.once('ready', () => {})` — once after login.
* `client.on('messageCreate', message => {})` — when a message is created (requires `GuildMessages`/`MessageContent` as appropriate).
* `client.on('interactionCreate', interaction => {})` — slash commands, buttons, select menus.
* `client.on('guildMemberAdd', member => {})` — new member joins (needs `GuildMembers` intent).

### Sending messages

* `channel.send('text')`
* `message.reply('text')` — replies and pings author (or with `allowedMentions: { repliedUser: false }` to avoid ping).
* `channel.send({ embeds: [embed] })` — send embed.
* `interaction.reply('ok')` — for slash commands.

### Embeds & components

```js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const embed = new EmbedBuilder().setTitle('Hello').setDescription('Rich message');

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('ok').setLabel('OK').setStyle(ButtonStyle.Primary)
);

// send
channel.send({ embeds: [embed], components: [row] });
```

### Slash commands (register & handle)

* Register commands via REST or per-guild for testing.
* Handle in `interactionCreate`:

```js
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ask') {
    await interaction.deferReply(); // show "thinking..."
    const prompt = interaction.options.getString('prompt');
    const reply = await generateResponseWithTimeout([{ role:'user', content: prompt }]);
    await interaction.editReply(reply);
  }
});
```

Slash commands remove the need for `MessageContent`.

---

# 11 — Example scenarios (where you’d use this bot)

1. **Personal assistant in a server** — answer FAQ, link docs, smalltalk. Use slash `/ask` or message-based chat.
2. **Support ticket bot** — open a private thread on `/ticket` and move conversation to a staff channel.
3. **Moderation bot** — auto delete blacklisted words, warn users, log actions to mod channel. Use `GuildMessages` + checks and moderate permissions.
4. **Welcome & onboarding** — DMs to new members, assign roles (`GuildMembers` intent).
5. **Game or quiz** — interactive multi-message flows with buttons and ephemeral replies.
6. **Scheduled announcements** — cron job or automations to post updates to channels.
7. **Logging bot** — store events in a DB for audit: message deletes, edits, member joins.

---

# 12 — Security & best practices (summary)

* Don’t request `MessageContent` unless you must; prefer slash commands.
* Keep the token secret. Regenerate on leak.
* Validate user input before sending to LLMs (prompt injection).
* Limit STM length; use a safety filter if you relay user content to external services.
* Use `process.env` for config and run under a process manager (PM2, systemd).
* Monitor logs and handle errors gracefully.

---

# 13 — Checklist for you (copy/paste)

* [ ] Fix `client.once("clientReady" -> "ready")`.
* [ ] Decide if you need `MessageContent`. If not, remove and use slash commands.
* [ ] Implement `splitMessage` that preserves code fences.
* [ ] Implement `generateResponse` wrapper with timeout & retry logic.
* [ ] Implement STM with bound length; consider Redis for durability.
* [ ] Add typing indicator and throttle outgoing messages (simple 200–300ms delay).
* [ ] Enable privileged intents in Developer Portal if you require them.
* [ ] Use `PermissionsBitField.Flags` instead of raw integers where possible.
* [ ] Add logging (message id, author id, timestamps) for debugging.
* [ ] Test heavily in a dev guild with minimal permissions.

---

# 14 — Final notes, tips & extras

* If you plan to deploy to many servers, plan sharding and persistent storage upfront.
* For privacy reasons, ask server owners to consent if you store message content.
* Use per-guild configuration storage for behavior toggles (channels allowed, prefixes, disabled features).
* Consider converting message-based AI flows to slash commands (or hybrid): users type `/chat my question` and the bot replies — removes need for `MessageContent`.

---