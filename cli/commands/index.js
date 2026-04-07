import { askCommand } from './ask.js';
import { connectCommand } from './connect.js';

export function setupCommands(program) {
    program.addCommand(connectCommand);
    program.addCommand(askCommand);
}
