<div align="center">
  <h1>💻 DB Insights CLI (`dbi`)</h1>
  <p><strong>A powerful, terminal-native client for the DB Insights infrastructure.</strong></p>
</div>

---

## 📖 Overview

The `dbi` module is an interactive command-line interface designed for DB Insights. It allows power users, data engineers, and backend developers to execute plain-English natural language queries directly from the terminal. 

The CLI interfaces securely with your local **DB Insights Next.js server** via HTTP REST architecture, bypassing direct database driver configurations in your terminal state.

## 🚀 Installation

Ensure the primary DB Insights server is configured and running, then install the CLI globally:

```bash
cd cli
npm install -g .
```

To run in development mode without installing it globally:
```bash
node bin/dbi.js <command>
```

## ⚙️ Commands & Usage

### 1. `dbi connect`
Initializes your local connection vault. The interactive prompter will collect database credentials securely.

```bash
$ dbi connect

? Select database engine: PostgreSQL
? Host: localhost
? Port: 5432
? Database: production_db
? Username: admin
...
```
*Note: Credentials are stored locally via `conf` in encrypted app data directories.*

### 2. `dbi ask`
Triggers the full NLP-to-SQL generation pipeline. The CLI sends the query and the saved schema up to the API, validates it, executes the transaction, and renders an ASCII-formatted table along with the AI analytical breakdown.

```bash
$ dbi ask "Fetch the top 5 highest grossing products in Q3"
```

#### Powerful Flags:
The `ask` command comes with options for pipelining automated jobs:

| Option | Shorthand | Description | Default |
|--------|-----------|-------------|---------|
| `--limit <n>` | `-l` | Set a strict terminal output render limit | `15` |
| `--output <file>` | `-o` | Redirect output payload to `.csv` or `.json` | None |

**Examples:**
```bash
# Output structured data to JSON
dbi ask "Show inactive users" --output inactive_users.json

# Fetch CSV data directly from a shell script
dbi ask "Monthly revenue grouped by category" -o report.csv
```

## 🧠 System Architecture

The CLI follows an stateless HTTP invocation flow, delegating heavy processing to the main DB Insights Next.js API layer.

1. **Metadata Resolution:** `dbi ask` pings `/api/schema` to retrieve the structural mapping of the configured DB.
2. **LLM Translation:** The query and schema traverse to `/api/generate` where the local Ollama instance synthesizes a safe `SELECT` statement.
3. **Execution & Rendering:** `/api/validate` and `/api/execute` sanitize and run the transaction.
4. **Synopsis Generation:** The output payload is fed into `/api/insights` for analytical breakdown, returning contextual text directly into STDOUT.

## 📁 Configuration Persistence

Configurations and states are securely decoupled from the project root and managed using `conf`. You can inject or override the target Next.js API via the configuration manifest depending on your OS.

- **Windows**: `%APPDATA%\db-insights-cli\config.json`
- **macOS**: `~/Library/Preferences/db-insights-cli/config.json`
- **Linux**: `~/.config/db-insights-cli/config.json`

## 🛠️ Extending the CLI

With a modular `commander.js` wrapper structure, implementing additional commands requires minimal boilerplate. Add a new file to `/commands` and export your `createCommand`:

```javascript
// commands/history.js
import { createCommand } from 'commander';

export const historyCommand = createCommand('history')
    .description('Dump previous query executions')
    .action(async () => {
         // Subroutine logic
    });
```
Then import and register it inside `commands/index.js`.

---

*Engineered for DB Insights. MIT Licensed.*
