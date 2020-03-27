const table = require('text-table');
const chalk = require('chalk');

console.log('\n' +chalk.bold('Open Project'));
console.log('Easily navigate to your project directories.\n');

console.log(chalk.bold('Usage:') +  ' openProject [options]\n');

console.log(chalk.bold('Options:'));
console.log(table([
	['', '--help', '-h', 'Dispay this help text and exit'],
	['', '--new', '-n', 'Start the prompt to add a new project']
])+'\n');

console.log('openProject@1.0.0', __dirname);
