#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { setupCommands } from '../commands/index.js';

const program = new Command();

program
    .name('dbi')
    .description('DB Insights CLI — Ask questions about your database in plain English.\nResults are shown as tables in the terminal and can be exported to JSON or CSV.')
    .version('1.0.0')
    .addHelpText('after', `
Quick Start:
  $ dbi connect                              Set up your database connection
  $ dbi ask "Show all users"                 Ask a question about your data
  $ dbi ask "Top 10 orders" --limit 10       Limit rows shown in terminal
  $ dbi ask "All sales" --output sales.csv   Save results to a CSV file
  $ dbi ask "Revenue summary" -o out.json    Save results to a JSON file

More Help:
  $ dbi connect --help                       Show connect command options
  $ dbi ask --help                           Show ask command options
`);

// Initial branding
console.log(chalk.bold.blue('\n══ DB INSIGHTS CLI ══'));
console.log(chalk.gray('Enterprise-grade data analysis'));

setupCommands(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
