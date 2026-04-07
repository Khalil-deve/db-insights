# DB Insights CLI — Complete Documentation

> **Purpose of this file:** This document explains the full CLI package — how it works,
> its file structure, all commands and options, how to run it, how to add new commands,
> and how to maintain it. Open this file whenever you return to this project.

---

## Table of Contents

1. [What Is This CLI?](#1-what-is-this-cli)
2. [Folder Structure](#2-folder-structure)
3. [How It Works — The Full Flow](#3-how-it-works--the-full-flow)
4. [Dependencies Explained](#4-dependencies-explained)
5. [Setup & Installation](#5-setup--installation)
6. [All Commands Reference](#6-all-commands-reference)
   - [dbi connect](#61-dbi-connect)
   - [dbi ask](#62-dbi-ask)
7. [Config Storage — Where Credentials Are Saved](#7-config-storage--where-credentials-are-saved)
8. [How to Add a New Command](#8-how-to-add-a-new-command)
9. [Error Handling Guide](#9-error-handling-guide)
10. [Known Limitations & Future Ideas](#10-known-limitations--future-ideas)

---

## 1. What Is This CLI?

The `dbi` CLI is a **terminal-based interface** for the DB Insights application.
It lets users ask plain English questions about their database directly from the terminal,
without needing to open the web browser.

**Example:**
```bash
dbi ask "Show me the top 5 customers by revenue" --output report.csv
```

The CLI talks to the **Next.js backend server** (which must be running separately)
via HTTP requests. It does NOT connect to the database directly — it always goes
through the backend API.

```
User Terminal
    │
    │  dbi ask "..."
    ▼
  CLI (this package)
    │
    │  HTTP POST requests (axios)
    ▼
  Next.js Backend  (http://localhost:3000)
    │
    ├── /api/schema    → reads DB structure
    ├── /api/generate  → AI writes SQL
    ├── /api/validate  → safety check
    ├── /api/execute   → runs the SQL
    └── /api/insights  → AI analysis of results
```

---

## 2. Folder Structure

```
cli/
├── bin/
│   └── dbi.js              ← Entry point. Runs when user types `dbi`
│                             Registers all commands and shows branding.
│
├── commands/
│   ├── index.js            ← Glue file. Registers all commands into the program.
│   ├── connect.js          ← `dbi connect` command — saves DB credentials to config
│   └── ask.js              ← `dbi ask` command — full AI query pipeline
│
├── utils/
│   └── config.js           ← Persistent config wrapper (uses `conf` library)
│                             Stores: dbConfig, apiUrl
│
├── package.json            ← CLI package definition, dependencies, bin entry
├── CLI_DOCS.md             ← THIS FILE — full documentation
└── node_modules/           ← Installed dependencies (never edit manually)
```

---

## 3. How It Works — The Full Flow

### Step 1 — Entry Point (`bin/dbi.js`)
When the user types `dbi`, Node.js runs `bin/dbi.js`.
- Creates the main Commander.js program object
- Prints the branded header in the terminal
- Calls `setupCommands(program)` which attaches all sub-commands
- Calls `program.parse(process.argv)` which reads what the user typed and routes it
- If user typed just `dbi` with no command → shows the help menu automatically

### Step 2 — Command Registration (`commands/index.js`)
This file imports every command and adds it to the program.
Think of it as the **router** — it maps `dbi connect` → `connectCommand`, `dbi ask` → `askCommand`.

To add a new command: create a file in `commands/`, import it here, and call `program.addCommand(yourCommand)`.

### Step 3 — `dbi connect` (`commands/connect.js`)
- Uses `inquirer` to show an interactive prompt in the terminal
- Asks for: DB type, host, port, username, password, database name
- Saves the answers to the local config using `config.set('dbConfig', answers)`
- SQLite only needs a file path (skips host/port/user/password questions)

### Step 4 — `dbi ask` (`commands/ask.js`)
This runs a **5-step pipeline** every time the user asks a question:

| Step | API Called | What Happens |
|------|-----------|--------------|
| 1 | `POST /api/schema` | Sends DB credentials → gets back table/column structure |
| 2 | `POST /api/generate` | Sends question + schema → AI returns SQL + explanation |
| 3 | `POST /api/validate` | Sends SQL → safety check (blocks DROP, DELETE, etc.) |
| 4 | `POST /api/execute` | Sends SQL + credentials → runs query → returns rows |
| 5 | `POST /api/insights` | Sends question + result → AI returns summary, findings, recommendation |

After step 4, results are displayed as a formatted ASCII table in the terminal.
After step 5, AI analysis is printed below the table.

---

## 4. Dependencies Explained

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^11.1.0 | Parses CLI arguments and defines commands/options |
| `inquirer` | ^9.2.12 | Interactive terminal prompts (used in `dbi connect`) |
| `axios` | ^1.6.2 | Makes HTTP requests to the Next.js backend |
| `chalk` | ^5.3.0 | Colors terminal output (blue headers, red errors, etc.) |
| `ora` | ^7.0.1 | Spinning loading indicators while waiting for API |
| `cli-table3` | ^0.6.3 | Renders query results as a formatted ASCII table |
| `conf` | ^12.0.0 | Saves/reads persistent config on disk (DB credentials) |

> ⚠️ **Important:** `chalk` v5, `ora` v7, and `conf` v12 are all **ESM-only** packages.
> That is why `package.json` has `"type": "module"` — all files must use `import/export`,
> NOT `require()`.

---

## 5. Setup & Installation

### Prerequisites
- Node.js 18 or higher
- The Next.js backend must be running at `http://localhost:3000`

### Install CLI dependencies
```bash
cd db-insights/cli
npm install
```

### Start the Next.js backend (required before using CLI)
```bash
cd db-insights
npm run dev
```

### Run the CLI (without global install)
```bash
cd db-insights/cli
node bin/dbi.js connect
node bin/dbi.js ask "Show all users"
```

### Install globally (so you can type `dbi` anywhere)
```bash
cd db-insights/cli
npm install -g .
```

After global install:
```bash
dbi connect
dbi ask "Show me top products"
```

### Uninstall global install
```bash
npm uninstall -g db-insights-cli
```

---

## 6. All Commands Reference

### 6.1 `dbi connect`

**What it does:** Starts an interactive setup wizard to save your database credentials locally.

```bash
dbi connect
```

**Prompts shown:**
| Prompt | Example Input | Notes |
|--------|-------------|-------|
| Database type | `mysql` / `postgres` / `sqlite` | Select with arrow keys |
| Host | `localhost` | Skipped for SQLite |
| Port | `3306` (MySQL) / `5432` (Postgres) | Skipped for SQLite |
| Username | `root` | Skipped for SQLite |
| Password | `••••••` | Hidden input, skipped for SQLite |
| Database name / path | `my_db` or `./data.sqlite` | Required for all types |

**After running:**
- Credentials are saved to your local machine (not the cloud)
- Run `dbi ask` immediately after — no restart needed

**Re-running connect:** Run `dbi connect` again at any time to overwrite the saved connection with a new one.

---

### 6.2 `dbi ask`

**What it does:** Asks a plain English question about your connected database. The AI generates SQL, validates it, runs it, and displays results.

```bash
dbi ask "<your question>" [options]
```

**Argument:**
| Name | Required | Description |
|------|----------|-------------|
| `<question>` | Yes | Your question in plain English. Always wrap in quotes. |

**Options:**
| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--limit <number>` | `-l` | `15` | Max rows to show in terminal table. Does NOT limit what is saved to file. |
| `--output <file>` | `-o` | _(none)_ | Save results to a file. Extension determines format: `.json` or `.csv` |
| `--help` | `-h` | — | Show help for this command |

**Usage Examples:**
```bash
# Basic question
dbi ask "Show all users"

# Limit rows in terminal
dbi ask "Show all orders" --limit 50
dbi ask "Show all orders" -l 50

# Save to JSON file
dbi ask "Revenue by country" --output revenue.json
dbi ask "Revenue by country" -o revenue.json

# Save to CSV file
dbi ask "All products" --output products.csv

# Combine limit + output
dbi ask "Monthly sales" -l 5 -o sales.csv
```

**Output file location:**
Files are saved **relative to where your terminal currently is** (`pwd`).
```bash
# If terminal is at C:\Users\You\Desktop\Testwork\
dbi ask "Show users" -o result.json
# → saves to C:\Users\You\Desktop\Testwork\result.json

# You can also give a full path:
dbi ask "Show users" -o C:\Users\You\Documents\result.json
```

**What gets displayed:**
```
══ GENERATED SQL ══
SELECT * FROM users LIMIT 15;
  This query retrieves all users from the database.

══ RESULTS (42 rows) ══
┌───┬──────────┬───────────────────────┬─────────┐
│ # │ name     │ email                 │ country │
├───┼──────────┼───────────────────────┼─────────┤
│ 1 │ Alice    │ alice@example.com     │ USA     │
│ 2 │ Bob      │ bob@example.com       │ UK      │
└───┴──────────┴───────────────────────┴─────────┘
... and 27 more rows.

══ AI ANALYSIS ══
The dataset contains 42 users across 8 countries...

Key Findings:
  1. Most users are from the USA (30%)
  2. ...

Recommendation:
  Consider segmenting users by country for targeted campaigns.
```

---

## 7. Config Storage — Where Credentials Are Saved

The CLI uses the `conf` package which saves config to a **JSON file on your local machine**.

**Location by OS:**
| OS | Path |
|----|------|
| Windows | `C:\Users\<you>\AppData\Roaming\db-insights-cli\config.json` |
| macOS | `~/Library/Preferences/db-insights-cli/config.json` |
| Linux | `~/.config/db-insights-cli/config.json` |

**What is stored:**
```json
{
  "dbConfig": {
    "type": "postgres",
    "host": "localhost",
    "port": "5432",
    "username": "myuser",
    "password": "mypassword",
    "database": "mydb"
  },
  "apiUrl": "http://localhost:3000"
}
```

> ⚠️ **Security Note:** Passwords are stored in plain text in this local file.
> Do not use this CLI with production credentials on a shared machine.
> For production use, consider adding encryption or using environment variables.

**To read config in any command file:**
```js
import config from '../utils/config.js';

const dbConfig = config.get('dbConfig');   // get saved DB connection
const apiUrl   = config.get('apiUrl');     // get backend server URL
```

**To change the API URL** (if Next.js runs on a different port):
```js
config.set('apiUrl', 'http://localhost:4000');
```

---

## 8. How to Add a New Command

Follow these exact steps to add a new command (e.g., `dbi history`):

### Step 1 — Create the command file
```
cli/commands/history.js
```

```js
import { createCommand } from 'commander';
import chalk from 'chalk';

export const historyCommand = createCommand('history')
    .description('Show your recent queries')
    .option('-n, --count <number>', 'Number of recent queries to show', '10')
    .addHelpText('after', `
Examples:
  $ dbi history
  $ dbi history --count 5
`)
    .action(async (options) => {
        // your logic here
        console.log(chalk.bold.blue('\n══ QUERY HISTORY ══'));
    });
```

### Step 2 — Register it in `commands/index.js`
```js
import { askCommand }     from './ask.js';
import { connectCommand } from './connect.js';
import { historyCommand } from './history.js';   // ← add this

export function setupCommands(program) {
    program.addCommand(connectCommand);
    program.addCommand(askCommand);
    program.addCommand(historyCommand);           // ← add this
}
```

That's it. No changes needed in `dbi.js` or anywhere else.

---

## 9. Error Handling Guide

### "No database connection found"
```
✖ No database connection found.
  Run `dbi connect` first.
```
**Cause:** User hasn't run `dbi connect` yet, or the config was cleared.
**Fix:** Run `dbi connect`.

---

### "Cannot reach the DB Insights server"
```
✖ Cannot reach the DB Insights server.
  Server URL: http://localhost:3000

  To fix this, start the Next.js server:
    cd db-insights
    npm run dev
```
**Cause:** The Next.js backend is not running.
**Fix:** Start it with `npm run dev` in the `db-insights` folder.

---

### "Query blocked for safety reasons"
```
✖ Query blocked for safety reasons.
  Reason: Query contains destructive operation (DELETE)
```
**Cause:** The AI accidentally generated a DELETE/DROP/UPDATE query.
**Fix:** Rephrase your question to be clearly read-only (e.g., "Show me..." instead of "Delete all...").

---

### "Could not generate insights"
The insights step failing will not stop the results from showing.
Only the AI Analysis section at the bottom will be missing.
**Cause:** Usually a slow/overloaded AI provider, or a timeout.
**Fix:** The rest of the output is still valid. Just re-run if you need insights.

---

## 10. Known Limitations & Future Ideas

### Current Limitations
| Limitation | Details |
|-----------|---------|
| No demo mode in CLI | The web app has a built-in demo DB, but `dbi ask` always needs a real connection |
| No query history | Previous questions are not saved anywhere |
| Plain text password storage | `conf` stores passwords unencrypted in a local JSON file |
| Single connection only | You can only store one DB connection at a time |
| No streaming output | Results only appear after the full API response is received |

### Future Improvement Ideas
| Idea | How to Implement |
|------|-----------------|
| `dbi ask --demo` flag | Add `--demo` option that calls `/api/demo` instead of `/api/schema` + `/api/execute` |
| `dbi history` command | Save each question + SQL to a local JSON file, display with `dbi history` |
| `dbi switch` command | Allow saving multiple named connections (e.g., `dbi switch production`) |
| Auto-detect server port | Ping common ports (3000, 4000, 8000) if the default fails |
| Retry on timeout | Wrap API calls in a retry loop (1–2 retries) for flaky AI providers |
| `--format table/json/csv` | Unified output format flag instead of separate `--output` |
| Color themes | Allow `--no-color` flag for CI/CD pipelines or log files |

---

*Last updated: February 2026*
*CLI Version: 1.0.0*
