import { createCommand } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import config from '../utils/config.js';

export const connectCommand = createCommand('connect')
    .description('Set up your database connection interactively.\nSupports MySQL, PostgreSQL, and SQLite. Credentials are saved locally.')
    .addHelpText('after', `
Examples:
  $ dbi connect                  Start the interactive setup wizard

Supported Databases:
  - mysql     (default port: 3306)
  - postgres  (default port: 5432)
  - sqlite    (provide a file path, e.g. ./mydb.sqlite)

Notes:
  - Your credentials are stored securely in your local config.
  - Run this again any time to switch to a different database.
  - After connecting, use 'dbi ask' to query your data.
`)
    .action(async () => {
        const questions = [
            {
                type: 'list',
                name: 'type',
                message: 'Select database type:',
                choices: ['mysql', 'postgres', 'sqlite']
            },
            {
                type: 'input',
                name: 'host',
                message: 'Database host:',
                default: 'localhost',
                when: (answers) => answers.type !== 'sqlite'
            },
            {
                type: 'input',
                name: 'port',
                message: 'Database port:',
                default: (answers) => answers.type === 'mysql' ? '3306' : '5432',
                when: (answers) => answers.type !== 'sqlite'
            },
            {
                type: 'input',
                name: 'username',
                message: 'Database user:',
                when: (answers) => answers.type !== 'sqlite'
            },
            {
                type: 'password',
                name: 'password',
                message: 'Database password:',
                mask: '*',
                when: (answers) => answers.type !== 'sqlite'
            },
            {
                type: 'input',
                name: 'database',
                message: 'Database name (or path for SQLite):'
            }
        ];

        const answers = await inquirer.prompt(questions);

        config.set('dbConfig', answers);

        console.log(chalk.green('\n Connection configured successfully!'));
        console.log(chalk.dim('Stored in local config.'));
    });
