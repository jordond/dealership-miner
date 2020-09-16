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
dealership-miner/1.0.0 darwin-x64 node-v14.9.0
$ dealership-miner --help [COMMAND]
USAGE
  $ dealership-miner COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dealership-miner commands`](#dealership-miner-commands)
* [`dealership-miner fetch`](#dealership-miner-fetch)
* [`dealership-miner help [COMMAND]`](#dealership-miner-help-command)
* [`dealership-miner init`](#dealership-miner-init)
* [`dealership-miner update [CHANNEL]`](#dealership-miner-update-channel)
* [`dealership-miner update-dataset`](#dealership-miner-update-dataset)

## `dealership-miner commands`

list all the commands

```
USAGE
  $ dealership-miner commands

OPTIONS
  -h, --help              show CLI help
  -j, --json              display unfiltered api data in json format
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --hidden                show hidden commands
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [@oclif/plugin-commands](https://github.com/oclif/plugin-commands/blob/v1.3.0/src/commands/commands.ts)_

## `dealership-miner fetch`

Fetch all the dealerships

```
USAGE
  $ dealership-miner fetch

OPTIONS
  -h, --help                   show CLI help
  -p, --population=population  Minimum population required for city
  -r, --refresh                Delete all previous data and start fresh

EXAMPLE
  $ dealership-miner fetch
```

_See code: [src/commands/fetch.ts](https://github.com/jordond/dealership-miner/blob/v1.0.0/src/commands/fetch.ts)_

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

## `dealership-miner init`

Initial config of the dataminer

```
USAGE
  $ dealership-miner init

OPTIONS
  -c, --cache=cache  Directory to save temporary files.
  -d, --data=data    Directory to save required files.
  -f, --force        Force setup
  -h, --help         show CLI help

EXAMPLES
  $ dealership-miner init
  $ dealership-miner init --data /home/foo/data
  $ dealership-miner init --force
```

_See code: [src/commands/init.ts](https://github.com/jordond/dealership-miner/blob/v1.0.0/src/commands/init.ts)_

## `dealership-miner update [CHANNEL]`

update the dealership-miner CLI

```
USAGE
  $ dealership-miner update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_

## `dealership-miner update-dataset`

Force an update of the dataset

```
USAGE
  $ dealership-miner update-dataset

EXAMPLE
  $ dealership-miner update
```

_See code: [src/commands/update-dataset.ts](https://github.com/jordond/dealership-miner/blob/v1.0.0/src/commands/update-dataset.ts)_
<!-- commandsstop -->
