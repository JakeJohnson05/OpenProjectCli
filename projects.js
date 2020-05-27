#!/usr/bin/env node

'use strict'

const { existsSync, writeFileSync, createReadStream, readFile } = require('fs');
const csv = require('csv-parser');
const { join } = require('path');
const { ReplaySubject, Observable } = require('rxjs');
const { map, take } = require('rxjs/operators');
const { green } = require('chalk');
const table = require('text-table');
const { numFocusLevels } = require('./common');

/** The path to the csv data folder */
const csvFolder = join(__dirname, 'project-data') + '\\';

/** Represents a project option */
class ProjectOption {
	/** @type {string}	The name of the Project */
	name;
	/** @type {string}	The path to the Project */
	value;
	/**
	 * @param {ProjectOption['name']}		name
	 * @param {ProjectOption['value']}	value
	 */
	constructor(name, path) {
		this.name = name;
		this.value = path;
	}

	/**
	 * Gets this.name and .path in the format for creating the table text layout
	 * @return {[string, string]}
	 */
	get valueForTable() {
		return [this.name, green('~/' + this.value)];
		// return [this.name, this.value === 'OPENLASTPATH' ? '' : green('~/' + this.value)];
	}
}

/**
 * maps the projects to ProjectOptions with some color in table format
 * @param {ProjectOption[]}	projects
 * @return {ProjectOption[]}
 */
const mapToColoredTableProjectOptions = projects => !(Array.isArray(projects) && projects.length) ? [] : table(
	projects.map(({ valueForTable }) => valueForTable)
).split('\n').map((name, i) => new ProjectOption(name, projects[i].value));

/**
 * Easily create the projects replay subjects
 * @return {Observable<ProjectOption[]>}
 */
const createProjectRS = () => new ReplaySubject(1).pipe(
	take(1),
	map(mapToColoredTableProjectOptions)
);

/** Creates the read stream for a project csv output */
const startStream = (projects$, i) => {
	const csvOutput = [];
	createReadStream(`${csvFolder}${i}.csv`)
		.pipe(csv())
		.on('data', ({ name, path }) => name && path && csvOutput.push(new ProjectOption(name, path)))
		.on('end', () => projects$.next(csvOutput));
}

// Check the csv file for each focus level. If a csv file do not exist, create it
for (let focus of [...Array(numFocusLevels).keys()]) if (!existsSync(`${csvFolder}${focus}.csv`)) writeFileSync(`${csvFolder}${focus}.csv`, 'name,path');

/** @type {Observable<ProjectOption[]>[]} All the projects observables in an Array */
const allProjects = [...Array(numFocusLevels)].map(_ => createProjectRS());

/** @type {ReplaySubject<string>} The path for the last opened project */
const lastOpenedProjectPath$ = new ReplaySubject(1).pipe(
	take(1),
	map(path => !path ? undefined : green('~/' + path))
);

// Load the contents of the last opened path (if exists);
readFile(join(__dirname, 'project-output-path.txt'), (err, data) => {
	if (err || !data.length) lastOpenedProjectPath$.next(undefined);
	else lastOpenedProjectPath$.next(data.toString().split('\n')[0].trim() || undefined);
});

// Start the read stream for each project
allProjects.forEach((projects$, i) => startStream(projects$, i));

module.exports.lastOpenedProjectPath$ = lastOpenedProjectPath$;
module.exports.allProjects = allProjects;
module.exports.ProjectOption = ProjectOption;
