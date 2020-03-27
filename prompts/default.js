/** Loading animation when finding the projects */
const { prompt, Separator } = require('inquirer');
const { writeFile } = require('fs');
const { join } = require('path');
const { green } = require('chalk');
const logSymbols = require('log-symbols');
const table = require('text-table');
// const { combineLatest } = require('rxjs');
// const { map } = require('rxjs/operators');
const oraSpinner = require('ora')('Finding Projects...');
const { allProjects, ProjectOption, lastOpenedProjectPath$ } = require('../projects');
const { getPositionText } = require('../constants');
const projectOutputPath = join(__dirname, '../project-output-path.txt');

/**
 * The prompt for a user to select a project
 * @param {ProjectOption[]}	projects
 * @param {string}					[lastOpenedProjectPath]
 * @param {string}					[focus]
 * @param {string}					[message]
 * @return {Promise<Void | string>}
 */
const selectProjectPrompt = (projects, lastOpenedProjectPath = undefined, focus = '0', message = 'Select Project:') => {
	/** The choices for the prompt */
	const choices = !projects ? [] : [
		...projects,
		new Separator()
	];

	const selectChoices = { names: [], values: [] }

	// Add the choices to view projects in other focuses
	for (let i = 0; i < allProjects.length; i++) if (i.toString() !== focus) {
		selectChoices.values.push(i)
		selectChoices.names.push(['', green(i), getPositionText(i)]);
	}

	if (selectChoices.names[0]) choices.push(new Separator('Search'));

	table(selectChoices.names, {
		align: ['l', 'r', 'l']
	}).split('\n').forEach((name, i) => choices.push({
		name,
		value: `OPENFOCUS ${selectChoices.values[i]}`
	}))

	choices.push({ name: 'Add New Project', value: 'CREATE NEW' });
	lastOpenedProjectPath && choices.push({ name: 'Open Last\t' + lastOpenedProjectPath, value: 'OPENLASTPATH' });
	choices.push(new Separator());
	
	return prompt([{
		type: 'list',
		name: 'Project',
		message,
		choices,
		pageSize: 10
	}]).then(({ Project }) => {
		if (!Project) throw Error('Project value does not exist');
		else if (/^OPENLASTPATH$/.test(Project)) process.exit(0);
		else if (/^CREATE NEW$/.test(Project)) return writeFile(projectOutputPath, '', _ => require('./add-project'));
		else if (/^OPENFOCUS [\d]+$/.test(Project)) return startProcess(Project.slice(10), lastOpenedProjectPath);
		else writeFile(projectOutputPath, Project, _ => process.exit(0));
	}).catch(_ => process.exit(1));
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

	// setTimeout(() => combineLatest(allProjects).pipe(
	// 	// map(projectsObservables => projectsObservables.flat())
	// 	map(projectsObservables => projectsObservables.reduce((acc, curr) => [...acc, ...curr]))
	// ).subscribe(projects => {
	setTimeout(() => allProjects[focusInt].subscribe(projects => {
		// If no projects, open the add project prompt or prompt to open a different focus
		if (!projects.length) {
			oraSpinner.warn('No Projects Found!');
			setTimeout(() => selectProjectPrompt(undefined, lastOpenedProjectPath, focus, 'Add a new project or search a different focus level:'), 500);
		}
		// Start initial prompt
		else {
			oraSpinner.succeed(`Found ${green(projects.length)} Project${projects.length === 1 ? '' : 's'}`);
			setTimeout(() => selectProjectPrompt(projects, lastOpenedProjectPath, focus), 100);
		}
	}), 100);
}

lastOpenedProjectPath$.subscribe(path => startProcess('0', path));
