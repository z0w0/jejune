# Jejune

Jejune is a tool that generates stereotypical usernames that can be used for
prototypes or boilerplate. Or just for fun.

It works using Markov chains to construct usernames from random words that
(usually) make sense in an order (e.g., `our` is used before `lord`, so it will
try and generate `ourlord`). It also comes with additional sugar to make the
usernames more realistic, such as mispelling words, wings (`xXx<name>xXx`) and
numbers before and after the username (biased towards birth dates).

## Installation

`npm install -g jejune`

## Usage

The `jejune` executable is pretty straight-forward:

```bash
$ jejune --help

  Usage: jejune [options] [generators..]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Examples:

    $ jejune christian
    $ jejune

$ for i in {1..5}; do bin/jejune christian; done
Lover_Of_our_Father94
ThroughchurchLover981
FotherOfhumanity132
xOxSinnedxOx
Heaven881
```

## Configuration

Jejune supports configuring general settings in a JSON file. It will be
loaded from `/etc/jejune/conf.json` or `~/.jejune/conf.json` (`%USERPROFILE\jejune\conf.json` on Windows).

An example configuration file with default settings:

```json
{
    "numbers": true,
    "wings": true,
    "literacy": 0.65
}
```

This enables numbers after and before the username (usually birth dates), wings (prefixes and suffixes)
and the literacy level is `0.65`, so 65% of the userbase will not misspell words.

Jejune has a modular generator system that is configured by JSON, allowing you
to declare your own method of generating usernames, usually related to a certain [sub-]culture.

The default generators are stored in the `generators` directory in Jejune's source directory.
System-wide ones are stored in `/etc/jejune/generators` (none on Windows) and user-wide ones
are in `~/.jejune/generators` (`%USERPROFILE%\jejune\generators` on Windows).

## API

### jejune([generators..])

If `generators` is not provided, generate a username using a random generator in any of the configuration
directories. If `generators` is an array, generate an array of usernames using the generators in the array
in their exact order. Otherwise, assume generators is the name of a generator and generate a username
using that.

#### Example

```js
var jejune = require("jejune");
var christian = jejune("christian"); // generates just a christian username
var some = jejune(["christian", "teenager", "gamer", "mlp"]); // generates an array of usernames in that order

console.log(jejune()); // username from random generator
```

N.B. Not all generators listed in the example are implemented yet.
