import { createCommand } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import fs from 'fs';
import path from 'path';
import config from '../utils/config.js';

export const askCommand = createCommand('ask')
    .argument('<question>', 'Your question in plain English (wrap in quotes if it has spaces)')
    .description('Ask a plain English question about your database.\nThe AI generates SQL, runs it safely, and shows the results as a table.')
    .option('-l, --limit <number>', 'Max number of rows to display in the terminal (default: 15)', '15')
    .option('-o, --output <file>', 'Save all results to a file. Use .json for JSON or .csv for CSV format')
    .addHelpText('after', `
Examples:
  $ dbi ask "Show all users"
  $ dbi ask "How many orders were placed last month?"
  $ dbi ask "Top 5 customers by revenue" --limit 5
  $ dbi ask "All products in Electronics" --output products.json
  $ dbi ask "Monthly sales report" -l 50 -o report.csv

Notes:
  - You must run 'dbi connect' before using this command.
  - --output saves ALL rows to file, regardless of --limit.
  - Supported file formats: .json, .csv (auto-detected from extension).
`)
    .action(async (question, options) => {
        const dbConfig = config.get('dbConfig');
        const apiUrl = config.get('apiUrl');

        if (!dbConfig || Object.keys(dbConfig).length === 0) {
            console.log(chalk.red('No database connection found.'));
            console.log(chalk.yellow('Run `dbi connect` first.'));
            return;
        }

        const spinner = ora('Initializing analysis...').start();

        try {
            // 1. Get Schema
            spinner.text = 'Fetching schema metadata...';
            const schemaRes = await axios.post(`${apiUrl}/api/schema`, dbConfig);
            if (!schemaRes.data.success) throw new Error(schemaRes.data.error || 'Failed to fetch schema');
            const schema = schemaRes.data.schema;

            // 2. Generate SQL
            spinner.text = 'AI is writing your SQL...';
            const genRes = await axios.post(`${apiUrl}/api/generate`, {
                question,
                schema
            });
            if (!genRes.data.success) throw new Error(genRes.data.error || 'SQL generation failed');
            const { sql, explanation } = genRes.data.query;

            // 3. Validate
            spinner.text = 'Verifying query safety...';
            const valRes = await axios.post(`${apiUrl}/api/validate`, { sql });
            if (!valRes.data.success) throw new Error(valRes.data.error || 'Validation failed');

            if (valRes.data.validation.status === 'blocked') {
                spinner.fail('Query blocked for safety reasons.');
                console.log(chalk.red(`\n Reason: ${valRes.data.validation.message}`));
                return;
            }

            // 4. Execute
            spinner.text = 'Executing query...';
            const execRes = await axios.post(`${apiUrl}/api/execute`, { sql, config: dbConfig });
            if (!execRes.data.success) throw new Error(execRes.data.error || 'Execution failed');
            const result = execRes.data.result;

            spinner.succeed('Query executed successfully!');

            // Display Information
            console.log(chalk.bold.blue('\n══ GENERATED SQL ══'));
            console.log(chalk.cyan(sql));
            console.log(chalk.dim(`\n ${explanation}`));

            // Resolve limit from --limit option
            const rowLimit = parseInt(options.limit) || 15;

            // Display Results Table
            if (result.rows && result.rows.length > 0) {
                console.log(chalk.bold.green(`\n══ RESULTS (${result.rowCount} rows) ══`));

                const head = Object.keys(result.rows[0]);
                const table = new Table({
                    head: ['#', ...head].map(h => chalk.bold.white(h)),
                    style: { head: [], border: [] }
                });

                // Limit rows for display
                const displayRows = result.rows.slice(0, rowLimit);

                displayRows.forEach((row, index) => {
                    const rowValues = Object.values(row).map(v => v === null ? chalk.dim('NULL') : String(v));
                    table.push([chalk.dim(index + 1), ...rowValues]);
                });

                console.log(table.toString());
                if (result.rowCount > rowLimit) {
                    console.log(chalk.dim(`... and ${result.rowCount - rowLimit} more rows.`));
                }

                // --output: Save results to file
                if (options.output) {
                    const outputPath = path.resolve(options.output);
                    const ext = path.extname(outputPath).toLowerCase();

                    if (ext === '.csv') {
                        // Build CSV content
                        const csvHeader = head.join(',');
                        const csvRows = result.rows.map(row =>
                            Object.values(row).map(v => {
                                if (v === null) return '';
                                const str = String(v);
                                // Wrap in quotes if contains comma, quote, or newline
                                return str.includes(',') || str.includes('"') || str.includes('\n')
                                    ? `"${str.replace(/"/g, '""')}"` : str;
                            }).join(',')
                        );
                        fs.writeFileSync(outputPath, [csvHeader, ...csvRows].join('\n'), 'utf-8');
                        console.log(chalk.bold.green(`\n Results saved as CSV → ${outputPath}`));
                    } else {
                        // Default: JSON
                        const jsonOutput = JSON.stringify({ sql, explanation, rowCount: result.rowCount, rows: result.rows }, null, 2);
                        fs.writeFileSync(outputPath, jsonOutput, 'utf-8');
                        console.log(chalk.bold.green(`\n Results saved as JSON → ${outputPath}`));
                    }
                }

            } else {
                console.log(chalk.yellow('\n Query returned no results.'));

                // Still save empty output if --output given
                if (options.output) {
                    const outputPath = path.resolve(options.output);
                    fs.writeFileSync(outputPath, JSON.stringify({ sql, explanation, rowCount: 0, rows: [] }, null, 2), 'utf-8');
                    console.log(chalk.bold.yellow(`\n✔ Empty result saved → ${outputPath}`));
                }
            }

            // 5. Insights
            const insightSpinner = ora('Generating AI insights...').start();
            try {
                const insightRes = await axios.post(`${apiUrl}/api/insights`, {
                    question,
                    result,
                    schema
                });

                if (insightRes.data.success && insightRes.data.insight) {
                    insightSpinner.succeed('Insights ready!');
                    console.log(chalk.bold.magenta('\n══ AI ANALYSIS ══'));
                    console.log(chalk.white(insightRes.data.insight.summary));

                    if (insightRes.data.insight.keyFindings.length > 0) {
                        console.log(chalk.bold.dim('\nKey Findings:'));
                        insightRes.data.insight.keyFindings.forEach((f, i) => {
                            console.log(chalk.magenta(` ${i + 1}. `) + chalk.gray(f));
                        });
                    }

                    if (insightRes.data.insight.recommendation) {
                        console.log(chalk.bold.yellow('\nRecommendation:'));
                        console.log(` ${insightRes.data.insight.recommendation}`);
                    }
                } else {
                    insightSpinner.info('No deep insights available for this result.');
                }
            } catch (err) {
                insightSpinner.fail('Could not generate insights.');
            }

            // Final Separator to divide multiple queries in terminal
            console.log(chalk.dim('\n' + '═'.repeat(process.stdout.columns || 50) + '\n'));

        } catch (err) {
            spinner.fail('An error occurred.');

            // Detect: server is not running (no response came back at all)
            const isServerDown =
                err.code === 'ECONNREFUSED' ||
                err.code === 'ENOTFOUND' ||
                err.code === 'ERR_NETWORK' ||
                err.message?.includes('ECONNREFUSED') ||
                err.message?.includes('fetch failed') ||
                err.message?.includes('Network Error') ||
                (!err.response && err.request);

            if (isServerDown) {
                const apiUrl = config.get('apiUrl') || 'http://localhost:3000';
                console.log(chalk.red('\n✖ Cannot reach the DB Insights server.'));
                console.log(chalk.yellow(`  Server URL: ${apiUrl}`));
                console.log(chalk.white('\n  To fix this, start the Next.js server:'));
                console.log(chalk.cyan('    cd db-insights'));
                console.log(chalk.cyan('    npm run dev'));
                console.log(chalk.dim('\n  Then try your command again.'));
            } else {
                // Real API or DB error — show what the server said
                const message = err.response?.data?.error || err.message || 'Unknown error';
                console.error(chalk.red(`\n  Error: ${message}`));
            }
        }
    });
