dealership-miner
================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/dealership-miner.svg)](https://npmjs.org/package/dealership-miner)
[![CircleCI](https://circleci.com/gh/jordond/dealership-miner/tree/master.svg?style=shield)](https://circleci.com/gh/jordond/dealership-miner/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/dealership-miner.svg)](https://npmjs.org/package/dealership-miner)
[![License](https://img.shields.io/npm/l/dealership-miner.svg)](https://github.com/jordond/dealership-miner/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g dealership-miner
$ dealership-miner COMMAND
running command...
$ dealership-miner (-v|--version|version)
dealership-miner/1.0.0 linux-x64 node-v12.10.0
$ dealership-miner --help [COMMAND]
USAGE
  $ dealership-miner COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dealership-miner hello [FILE]`](#dealership-miner-hello-file)
* [`dealership-miner help [COMMAND]`](#dealership-miner-help-command)

## `dealership-miner hello [FILE]`

describe the command here

```
USAGE
  $ dealership-miner hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ dealership-miner hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/jordond/dealership-miner/blob/v1.0.0/src/commands/hello.ts)_

## `dealership-miner help [COMMAND]`

display help for dealership-miner

```
USAGE
  $ dealership-miner help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
