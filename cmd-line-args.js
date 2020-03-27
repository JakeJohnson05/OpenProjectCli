/** Flags from the cmd line */
const CMD_LINE_OPTIONS = {
	help: false,
	createNew: false,
	// projectName: undefined
}

process.argv.forEach(arg => {
	if (/^(-){1,2}h(elp)?$/.test(arg)) CMD_LINE_OPTIONS.help = true;
	else if (/^(-){1,2}n(ew)?$/.test(arg)) CMD_LINE_OPTIONS.createNew = true;
	// else CMD_LINE_OPTIONS.projectName = arg;
})

module.exports = CMD_LINE_OPTIONS;
