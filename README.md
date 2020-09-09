# to-ical

A TypeScript-native, 0-dependency iCalendar encoder.

to-ical turns your calendar data into an [RFC2445](https://tools.ietf.org/html/rfc5545)-compliant
format.

## Usage

This project uses [Yarn](https://yarnpkg.com/). Make sure you have it installed
before continuing.

Set up the repository locally
```sh
git clone https://github.com/opensourceryclub/to-ical.git
cd to-ical
yarn
```

Compile the source code
```
# Make a production build, ready for use in your application
yarn build:prod

# Watch source files and rebuild on changes in test mode
yarn watch:test

# Start up a development server that hot reloads on file changes
yarn serve:dev
```

## Commands

All `yarn` commands (except `test`) follow the following definition:

```
yarn <cmd>:<env?>
```

where `cmd` is

- `build` - Compiles the TypeScript into a browser-consumable form
- `watch` - Same as `build`, but watches for changes to source files and re-builds on changes.
- `serve` - Same as `watch`, but also starts a development server at port `9000`

and `env` is `dev`, `test`, `prod`, or omitted.
