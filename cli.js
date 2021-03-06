#!/usr/bin/env node
'use strict'

// require('inquirer-exit-listener');
// const exitFunction = (code = 1) => {
// 	console.log('');
// 	process.exit(code);
// }

// process.openStdin().on('keypress', function (_, key) {
// 	if (key) {
// 		if (key.name === 'c' && key.ctrl) exitFunction();
// 		else if (key.name === 'escape') exitFunction();
// 	}
// });

const oraSpinner = require('ora')('Finding Projects...');
const { writeFile } = require('fs');
const { join } = require('path');
const inquirer = require('inquirer');
const { green, bold } = require('chalk');
const logSymbols = require('log-symbols');
const table = require('text-table');
const yargs = require('yargs/yargs')(process.argv.slice(2));
const { writeDoNotEditFile, getPositionText } = require('./common');
const { allProjects, lastOpenedProjectPath$ } = require('./projects');

const projectOutputPath = join(__dirname, 'project-output-path.txt');
const { argv } = yargs
	.scriptName('openProject')
	.wrap(Math.min(100, yargs.terminalWidth()))
	.usage('')
	.usage(bold('open-project'))
	.usage('  Easily navigate to your project directories')
	.usage('')
	.usage('Usage:')
	.usage('  $ openProject [options]')
	.usage('Aliases: op')
	.help()
	.alias('h', 'help')
	.default('help', false)
	.option('version', {
		alias: ['v'],
		type: 'boolean',
		describe: 'Show current installed version',
		default: false
	})
	// TODO: Insert message about adding bash script function/alias
	.option('last', {
		alias: ['l'],
		type: 'boolean',
		describe: 'Navigate to the last opened Project',
		default: false
	})
	.option('new', {
		alias: ['n'],
		type: 'boolean',
		describe: 'Start the prompt to add a new Project',
		default: false
	})
	.exitProcess(false)
	.epilog('Visit https://github.com/JakeJohnson05/OpenProjectCli for more info');

/**
 * The prompt for a user to select a project
 * @param {import('./projects').ProjectOption[]}	projects
 * @param {string}					[lastOpenedProjectPath]
 * @param {string}					[focus]
 * @param {string}					[message]
 * @return {Promise<void | string>}
 */
const selectProjectPrompt = (projects, lastOpenedProjectPath = undefined, focus = '0', message = 'Select Project:') => {
	/** The choices for the prompt */
	const choices = projects ? [...projects, new inquirer.Separator()] : [];
	const selectChoices = { names: [], values: [] }

	// Add the choices to view projects in other focuses
	for (let i = 0; i < allProjects.length; i++) if (i.toString() !== focus) {
		selectChoices.values.push(i)
		selectChoices.names.push(['', green(i), getPositionText(i)]);
	}
	if (selectChoices.names[0]) {
		choices.push(new inquirer.Separator('Search'));
		table(selectChoices.names, {
			align: ['l', 'r', 'l']
		}).split('\n').forEach((name, i) => choices.push({
			name,
			value: `OPENFOCUS ${selectChoices.values[i]}`
		}));
	}

	choices.push({ name: 'Add New Project', value: 'CREATE NEW' });
	lastOpenedProjectPath && choices.push({ name: 'Open Last\t' + lastOpenedProjectPath, value: 'OPENLASTPATH' });
	choices.push(new inquirer.Separator());

	inquirer.prompt([{
		type: 'list',
		name: 'Project',
		message,
		choices,
		pageSize: 10
	}]).then(({ Project }) => {
		if (!Project) throw Error('Project value does not exist');
		else if (/^OPENLASTPATH$/.test(Project)) process.exit(0);
		else if (/^CREATE NEW$/.test(Project)) return writeDoNotEditFile('true', require, './add-project-prompt');
		else if (/^OPENFOCUS /.test(Project)) return startProcess(Project.slice(10), lastOpenedProjectPath);
		else writeFile(projectOutputPath, Project, _ => process.exit(0));
	}).catch(err => {
		err && console.error(err);
		process.exit(1);
	});
}

/**
 * Subscribe to the observable to start the process for the specific focus level
 * @param {string} [focus]
 * @param {string} [lastOpenedProjectPath]
 */
const startProcess = (focus = '0', lastOpenedProjectPath = undefined) => {
	if (!(focus && /^[\d]+$/.test(focus))) {
		console.error('Invalid focus level: ' + focus + '\nNot a valid integer');
		process.exit(1);
	}
	/** The parsed integer from the focus parameter string */
	let focusInt = parseInt(focus);
	if (focusInt >= allProjects.length) {
		console.error('Invalid focus level: ' + focus + '\nFocus level does not exist');
		process.exit(1);
	}

	console.log(logSymbols.info, `Searching for projects with \`${getPositionText(focusInt)}\` focus - (${focusInt})`);
	oraSpinner.start('Finding Projects...');

	setTimeout(() => allProjects[focusInt].subscribe(projects => {
		if (!projects.length) { // If no projects, open the add project prompt or prompt to open a different focus
			oraSpinner.warn('No Projects Found!');
			setTimeout(() => selectProjectPrompt(undefined, lastOpenedProjectPath, focus, 'Add a new project or search a different focus level:'), 500);
		} else { // Start initial prompt
			oraSpinner.succeed(`Found ${green(projects.length)} Project${projects.length === 1 ? '' : 's'}`);
			setTimeout(() => selectProjectPrompt(projects, lastOpenedProjectPath, focus), 100);
		}
	}), 100);
}

// Prevent bash from opening `project-output-path.txt` and exit script
if (argv.help || argv.version) writeDoNotEditFile();
// Start the prompt to add a new project
else if (argv.new) require('./add-project-prompt');
// Else open the projects
else lastOpenedProjectPath$.subscribe(path => {
	// Check for the --last flag
	if (argv.last) {
		// If the last opened path exists - terminate the process with status 0 so the path is opened
		path && process.exit(0);
		oraSpinner.warn('Last opened project path not found');
	}
	// Finally if nothing above - start the selection process
	startProcess('0', path)
});
