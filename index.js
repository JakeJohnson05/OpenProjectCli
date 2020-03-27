const exitFunction = (code = 1) => {
	console.log('');
	process.exit(code);
}
process.openStdin().on('keypress', function (_, key) {
	if (key) {
		if (key.name === 'c' && key.ctrl) exitFunction();
		else if (key.name === 'escape') exitFunction();
	}
});

const CMD_LINE_OPTS = require('./cmd-line-args');

if (CMD_LINE_OPTS.help) require('./help-info');
else if (CMD_LINE_OPTS.createNew) require('./prompts/add-project');
else require('./prompts/default');
