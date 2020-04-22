#!/usr/bin/env node

'use strict'

const inquirer = require('inquirer');
const { existsSync, lstatSync, appendFile, writeFile } = require('fs');
const { join, relative } = require('path');
const { green } = require('chalk');
const { allProjects } = require('./projects');
const { getPositionText } = require('./constants');
/** The home directory path */
const homedir = require('os').homedir();

/** Matches to input that are reserved keywords */
const invalidValues = [/^CREATE NEW$/, /^OPENFOCUS [\d]+$/, /^OPENLASTPATH$/];

inquirer.prompt([
	{
		type: 'list',
		name: 'Focus',
		message: 'Project Focus:',
		choices: [...Array(allProjects.length).keys()].map(value => ({ name: green(value) + ' - ' + getPositionText(value), value }))
	}, {
		type: 'input',
		name: 'ProjName',
		message: 'What\'s the Project Name:',
		filter: input => new Promise(resolve => resolve(input ? input.trim() : input)),
		validate: input => input ? true : 'Must be a valid string'
	}, {
		type: 'input',
		name: 'ProjPath',
		message: 'What\'s the relative path to the Project Root: ~/',
		default: () => relative(homedir, process.cwd()).replace(/\\/g, '/').replace(/ /g, '\\ ') + '/',
		filter: input => new Promise(resolve => {
			if (!input) return resolve(input);
			input = input.trim();
			if (/[^/]$/.test(input)) input += '/';
			return resolve(input);
		}),
		validate: input => {
			if (!input) return 'Must be a valid path';
			if (!/^[^\s~/\\][^:\n].*$/i.test(input)) return 'Must not be an absolute path: Paths are relative to `~/`';
			for (let invalidRegex of invalidValues) if (invalidRegex.test(input)) return 'Path is a reserved keyword';
			return (existsSync(join(homedir, input)) && lstatSync(join(homedir, input)).isDirectory()) ? true : 'Not a valid directory';
		}
	}
]).then(({ Focus, ProjName, ProjPath }) => appendFile(
	join(__dirname, `../project-data/${Focus}.csv`), `\n${ProjName},${ProjPath}`, err => {
		if (err) {
			console.error('Issue appending the new Project Data:', err);
			process.exit(1);
		}
		writeFile(join(__dirname, '../project-output-path.txt'), ProjPath, () => process.exit(0));
	}
));
