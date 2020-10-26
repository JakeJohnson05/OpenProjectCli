# Open Project

<!-- [![Build Status](https://travis-ci.org/JakeJohnson05/OpenProjectCli.svg?branch=master)](https://travis-ci.org/JakeJohnson05/OpenProjectCli) -->
<!-- [![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/JakeJohnson05/OpenProjectCli/master/LICENSE) -->

Interactive choices to navigate to a project directory on your local machine

## bashrc script
```sh
alias op="openProject"
openProject() {
	# Run the open_project node module
	node ~/.bash_scripts/open_project $*
	[[ "$?" != "0" ]] && return 1

	# Check if output path should be ignored
	[[ -n "$(cat ~/.bash_scripts/open_project/do-not-open-output-path.txt 2>/dev/null)" ]] && {
		rm -f ~/.bash_scripts/open_project/do-not-open-output-path.txt
		return 0
	}

	# Check if output path exists and the value is valid
	[[ -n "$(cat ~/.bash_scripts/open_project/project-output-path.txt 2>/dev/null)" ]] || return 1

	# Path to the output value
	local projectPath=$(<~/.bash_scripts/open_project/project-output-path.txt)
	cd ~/${projectPath}
}
```

## :arrow_down: Install

```sh
$ npm install JakeJohnson/OpenProjectCli
```
