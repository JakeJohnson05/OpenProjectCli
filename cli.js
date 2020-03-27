#!/usr/bin/env node

"use strict"

const CMD_LINE_OPTS = require('./cmd-line-args');
require('inquirer-exit-listener');

if (CMD_LINE_OPTS.help) require('./help-info');
else if (CMD_LINE_OPTS.createNew) require('./prompts/add-project');
else require('./prompts/default');
