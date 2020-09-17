# dealership-miner

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/dealership-miner.svg)](https://npmjs.org/package/dealership-miner)
[![CircleCI](https://circleci.com/gh/jordond/dealership-miner/tree/master.svg?style=shield)](https://circleci.com/gh/jordond/dealership-miner/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/dealership-miner.svg)](https://npmjs.org/package/dealership-miner)
[![License](https://img.shields.io/npm/l/dealership-miner.svg)](https://github.com/jordond/dealership-miner/blob/master/package.json)

<!-- toc -->

-   [dealership-miner](#dealership-miner)
-   [Prerequisites](#prerequisites)
-   [Usage](#usage)
-   [Commands](#commands)
<!-- tocstop -->

# Prerequisites

1. You need to obtain a Google Places API Key
    - Follow the steps [here](https://developers.google.com/places/web-service/get-api-key)
1. Then download the installer from [here]()

# Usage

### Step 1

Once it is installed, you need to open up a terminal. - You can do this by hitting the windows key, then typing "cmd"

### Step 2 - Setup

Run the following command to setup:

```bash
dealership-dataminer init
```

It will ask you a bunch of questions, you should be able to leave them all as DEFAULT. Except for the Google API key, you need to paste your api key when prompted.

### Step 3 - Fetch information

Run the following command:

```bash
dealership-dataminer fetch
```

1. It will ask you which state you want to search
1. It will then ask you the MINIMUM population required for a city
    - It defaults to 5000, which is a good minimum, you _can_ lower it if you want
1. Confirm the choices
1. It will then fetch all of the known dealerships
    - It is only fetching their IDs
1. Confirm again
1. It will now fetch all the details about each dealership

Once this command completes, you can repeat for all of the other states you need.

### Step 4 - Generate Report

Here is where you actually generate the report

Run the following command:

```bash
dealership-dataminer generate
```

1. It will ask you if you want to create an HTML or Excel file
    - You probably only need the excel file
1. Then it will ask you where to save the report
    - It will default to the current directory your terminal is in
1. Select all the regions you want to include in the report
1. Confirm

Your report will then be generated!

<!-- usagestop -->

# Commands

<!-- commands -->

-   [`dealership-miner commands`](#dealership-miner-commands)
-   [`dealership-miner fetch`](#dealership-miner-fetch)
-   [`dealership-miner generate`](#dealership-miner-generate)
-   [`dealership-miner help [COMMAND]`](#dealership-miner-help-command)
-   [`dealership-miner init`](#dealership-miner-init)
-   [`dealership-miner update [CHANNEL]`](#dealership-miner-update-channel)
-   [`dealership-miner update-dataset`](#dealership-miner-update-dataset)

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
  -f, --force                  Delete all previous data and start fresh
  -h, --help                   show CLI help
  -p, --population=population  Minimum population required for city
  -w, --workers=workers        How many concurrent workers to use.
  --pretty                     Print the dataset in a human readable format. NOTE: Will increase filesize
  --region=region              Which region to fetch data for, example: MI

EXAMPLES
  $ dealership-miner fetch
  $ dealership-miner fetch --pretty
  $ dealership-miner fetch --workers 8
  $ dealership-miner fetch --force
```

_See code: [src/commands/fetch.ts](https://github.com/jordond/dealership-miner/blob/v1.0.1/src/commands/fetch.ts)_

## `dealership-miner generate`

Generate reports from the dealership dataset

```
USAGE
  $ dealership-miner generate

OPTIONS
  -f, --format=format  Format for the report (both|excel|html)
  -h, --help           show CLI help
  -o, --output=output  [default: ./] Path to save the generated report
  -y, --yes            Ignore all confirmation checks

EXAMPLES
  $ dealership-miner generate
  $ dealership-miner generate --output /home/user/temp
  $ dealership-miner generate --format both
  $ dealership-miner generate --format html
```

_See code: [src/commands/generate.ts](https://github.com/jordond/dealership-miner/blob/v1.0.1/src/commands/generate.ts)_

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
  --pretty           Output human readable city data. NOTE: This will increase filesize.

EXAMPLES
  $ dealership-miner init
  $ dealership-miner init --data /home/foo/data
  $ dealership-miner init --force
  $ dealership-miner init --pretty -c /tmp/foo
```

_See code: [src/commands/init.ts](https://github.com/jordond/dealership-miner/blob/v1.0.1/src/commands/init.ts)_

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

OPTIONS
  --pretty  Output human readable city data. NOTE: This will increase filesize.

EXAMPLES
  $ dealership-miner update-dataset
  $ dealership-miner update-dataset --prety
```

_See code: [src/commands/update-dataset.ts](https://github.com/jordond/dealership-miner/blob/v1.0.1/src/commands/update-dataset.ts)_

<!-- commandsstop -->

```

```
