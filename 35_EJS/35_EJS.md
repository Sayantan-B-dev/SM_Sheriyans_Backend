# EJS + Express view engine, `morgan` logger, and everything about EJS delimiters & includes — deep, practical explainer

I'll walk you through setup, purpose, and *every important EJS delimiter* (syntax, name, what it does), how `includes` work, how `res.render(...)` uses the data you pass, plus `morgan` logging (formats, examples, how to hook into other loggers). I’ll give copy-paste examples and show exact HTML output for your snippet.

---

# 1 — Quick Express + EJS setup (minimal, correct)

```js
// app.js
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Views folder and engine
app.set('views', path.join(__dirname, 'views')); // default: "./views"
app.set('view engine', 'ejs'); // use ejs files: res.render('name') -> views/name.ejs

// Logging (morgan) — put near top so it logs all requests
app.use(morgan('dev')); // other formats below

// example route
app.get('/', (req, res) => {
  res.render('test', {
    title: 'Home',
    user: { name: 'Sayantan' }
  });
});

app.listen(3000, () => console.log('Listening on :3000'));
```

* `app.set('view engine', 'ejs')` tells Express to use EJS for rendering.
* `res.render('test', { ... })` loads `views/test.ejs` and injects the passed object as template locals (accessible directly by name inside the template).

---

# 2 — How `res.render()` passes data to the template

Call:

```js
res.render('test', {
  title: 'Home',
  user: { name: 'Sayantan' }
});
```

Inside `views/test.ejs` you can use `title` and `user` directly:

```ejs
<h1><%= title %></h1>
<p>Hello, <%= user.name %></p>
```

Rendered result (final HTML sent to the browser):

```html
<h1>Home</h1>
<p>Hello, Sayantan</p>
```

---

# 3 — EJS: server-side templating basics

* EJS files are plain HTML with special `<% %>` tags to run JavaScript, print variables, include templates, and control flow.
* The data passed to `res.render` are available as local variables in the template (no `data.` prefix required unless you want to).

---

# 4 — All important EJS delimiters (names, syntax, purpose, examples, output)

EJS uses a delimiter pair around JS code. Default delimiter is `%` inside `<% %>`. Below are the most important variations.

> For all examples assume `const title = "Hello & <Friends>"; const bio = "<script>alert('x')</script>";`

### 1. Scriptlet (control flow / run JS, no output)

* **Syntax:** `<% JavaScript code %>`
* **Purpose:** run JS (if statements, loops, variable definitions) but do not print result
* **Example:**

  ```ejs
  <% if (user) { %>
    <p>Welcome back</p>
  <% } %>
  ```
* **Output:** only the HTML inside the conditional if true. The `<% ... %>` lines produce nothing directly.

### 2. Escaped output (print, HTML-escaped)

* **Syntax:** `<%= expression %>`
* **Purpose:** evaluate expression and escape HTML characters (`&`, `<`, `>`, `"` etc.) to prevent XSS
* **Example:**

  ```ejs
  <h1><%= title %></h1>
  ```
* **Given `title = "Hello & <Friends>"` Output:**

  ```html
  <h1>Hello &amp; &lt;Friends&gt;</h1>
  ```

### 3. Unescaped / Raw output (print without escaping)

* **Syntax:** `<%- expression %>`
* **Purpose:** output HTML as-is (useful for embedding preformatted HTML or outputs that are already safe)
* **Example:**

  ```ejs
  <div><%- bio %></div>
  ```
* **Given `bio = "<script>alert('x')</script>"` Output:**

  ```html
  <div><script>alert('x')</script></div>
  ```
* **Security note:** only use `<%-` with trusted data or when you intentionally want raw HTML. Using user input here can lead to XSS.

### 4. Comment (server-side comment, not rendered)

* **Syntax:** `<%# comment %>`
* **Purpose:** put a comment in the template that will not appear in the rendered HTML
* **Example:**

  ```ejs
  <%# This is a template comment and will not be sent to the client %>
  ```

### 5. Whitespace trimming (left/right trim)

* **Syntax:** `<%_` ... `_ %>` (underscore around delimiters)
* **Purpose:** trim whitespace/newlines to control layout/newlines in generated HTML
* **Example:**

  ```ejs
  <ul>
    <%_ items.forEach(item => { _%>
      <li><%= item %></li>
    <%_ }) _%>
  </ul>
  ```
* **Effect:** prevents leftover blank lines around scriptlet tags.

### 6. Trailing hyphen to remove following newline (`-%>`) and leading hyphen (`<%-`) around code

* `-%>` can be used to remove the trailing newline after a tag.
* Example:

  ```ejs
  <% if (cond) { -%>
  <p>Something</p>
  <% } %>
  ```

  This removes the blank line after the opening tag.

---

# 5 — Changing the delimiter (when you need it)

EJS default delimiter is `%`. If that collides with other templates you can change it using the `delimiter` option when rendering or compiling:

```js
const ejs = require('ejs');

// renderFile with custom delimiter '?'
ejs.renderFile('views/template.ejs', data, { delimiter: '?' }, (err, html) => { /* ... */ });

// or compile with options
const compiled = ejs.compile(str, { delimiter: '?' });
```

If you use `res.render()` and want to pass options to EJS you can pass them as the third argument:

```js
res.render('test', locals, { delimiter: '?' });
```

(You can also set global options in some setups by passing options into `app.engine`, but explicit per-render options are clear and safe.)

---

# 6 — Includes / Partials — how to factor templates

**Include** allows you to embed another EJS file inside a template (typical for header/footer/partials).

**Syntax:**

```ejs
<%- include('partials/header') %>
```

* Use `<%- include(...) %>` (note the unescaped `<%-`) because `include()` returns raw HTML that you usually want inserted directly.
* `include` uses the `views` path, and relative includes from the current file are supported: `include('./sidebar')`.

**Pass locals to an include:**

```ejs
<%- include('partials/item', { item: currentItem }) %>
```

Inside `partials/item.ejs` you can access `item`.

**Example layout (views/test.ejs):**

```ejs
<%- include('partials/header', { title: title }) %>

<h1><%= title %></h1>
<p>Hello, <%= user.name %></p>

<%- include('partials/footer') %>
```

**What the include does:** it reads the partial file, compiles it with the provided locals merged with the current locals, and inserts the resulting HTML.

---

# 7 — Example `views/test.ejs` (full sample) and expected output

`views/partials/header.ejs`:

```ejs
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title><%= title %> — MySite</title>
</head>
<body>
<header><h2><%= title %></h2></header>
```

`views/partials/footer.ejs`:

```ejs
<footer>© 2025 MySite</footer>
</body>
</html>
```

`views/test.ejs`:

```ejs
<%- include('partials/header', { title: title }) %>

<main>
  <%# welcome message - this is a server-side comment %>
  <% if (user) { %>
    <p>Welcome back, <strong><%= user.name %></strong></p>
  <% } else { %>
    <p>Welcome, guest</p>
  <% } %>

  <% // demonstrate raw html insertion %>
  <section>
    <h3>Bio (raw)</h3>
    <div><%- bio || 'No bio provided' %></div>
  </section>
</main>

<%- include('partials/footer') %>
```

If you call `res.render('test', { title: 'Home', user: { name: 'Sayantan' }, bio: '<i>Dev</i>' })`
the final HTML will be (trimmed formatting):

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Home — MySite</title>
</head>
<body>
<header><h2>Home</h2></header>

<main>
    <p>Welcome back, <strong>Sayantan</strong></p>

  <section>
    <h3>Bio (raw)</h3>
    <div><i>Dev</i></div>
  </section>
</main>

<footer>© 2025 MySite</footer>
</body>
</html>
```

---

# 8 — EJS control flow & common patterns

* **Loop:**

  ```ejs
  <ul>
    <% items.forEach(function(item){ %>
      <li><%= item %></li>
    <% }); %>
  </ul>
  ```

* **Ternary inline:**

  ```ejs
  <p><%= user ? user.name : 'Guest' %></p>
  ```

* **Assign local var in template:**

  ```ejs
  <% const prefix = user && user.name ? user.name.split(' ')[0] : 'Guest'; %>
  Hello <%= prefix %>
  ```

* **Trim whitespace for neat HTML:** use `<%_` and `_ %>` as needed.

---

# 9 — EJS on the client (brief)

* EJS can also compile templates to client-side JS and render in the browser, but the common use with Express is server-side rendering.
* If you plan client-side EJS, be careful: the template engine and delimiter settings must be loaded client-side, and you should not send secret logic.

---

# 10 — `morgan` logger — setup, formats, examples, custom tokens

**Install:**

```bash
npm i morgan
```

**Basic usage (dev format):**

```js
const morgan = require('morgan');
app.use(morgan('dev'));
```

**Common built-in formats:**

* `'combined'` — standard Apache combined log (remote addr, user, date, request, status, referrer, user-agent).
* `'common'` — common log format (without referrer and user-agent).
* `'dev'` — colored concise output: `:method :url :status :response-time ms - :res[content-length]`
* `'short'` — shorter, useful for concise logs.
* `'tiny'` — minimal: `:method :url :status :res[content-length] - :response-time ms`

**Examples:**

* `morgan('dev')` request log:

```
GET / 200 12.345 ms - 102b
```

* `morgan('combined')`:

```
::1 - - [24/Dec/2025:13:00:00 +0530] "GET / HTTP/1.1" 200 512 "-" "Mozilla/5.0 (....)"
```

**Custom token & format:**

```js
morgan.token('id', function getId(req) { return req.id || '-'; });
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));
```

**Hooking morgan into another logger (like winston):**

```js
const winston = require('winston');
const logger = winston.createLogger(/*...*/);

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
```

This makes all HTTP logs go through your application logger (structured logging, rotation, etc.).

**Place `app.use(morgan(...))` early** so it logs every request (including static, errors).

---

# 11 — Practical tips, gotchas, and best practices

1. **Escape by default.** Use `<%= %>` to print user strings safely. Only use `<%- %>` for trusted/explicit HTML.
2. **Avoid logic-heavy templates.** Keep complex logic in controllers — templates should mostly format and display.
3. **Use partials/includes for DRY.** Header/footer/navigation as partials.
4. **Trim whitespace** with `<%_` and `_%>` when you want tight, predictable HTML output.
5. **Pass small, explicit locals.** Passing huge objects to the template is okay but keep it intentional.
6. **Cache templates in production.** Express/EJS caches compiled templates when `NODE_ENV === 'production'`.
7. **Avoid mixing template delimiters** with other systems that use similar tokens. If collision happens, change the delimiter via options.
8. **Log requests with `morgan`** in dev and push logs into winston/structured logger for production.

---

# 12 — Short checklist for your app

* [ ] `npm i ejs morgan` (if not already installed)
* [ ] `app.set('view engine', 'ejs')` and `app.set('views', path.join(__dirname, 'views'))`
* [ ] Use `<%= %>` for escaped output and `<%- %>` for raw HTML carefully
* [ ] Use `<%# %>` for server-side comments
* [ ] Use `<%- include(...) %>` for partials; pass locals when needed
* [ ] Place `app.use(morgan('dev'))` near the top of middleware stack
* [ ] Add `sendTyping` and `splitMessage` only if integrating with chat/LLM responses (from previous bot conversation)

---
