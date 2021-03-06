# egg-we-app-engine

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-we-app-engine.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-we-app-engine
[travis-image]: https://img.shields.io/travis/eggjs/egg-we-app-engine.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-we-app-engine
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-we-app-engine.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-we-app-engine?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-we-app-engine.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-we-app-engine
[snyk-image]: https://snyk.io/test/npm/egg-we-app-engine/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-we-app-engine
[download-image]: https://img.shields.io/npm/dm/egg-we-app-engine.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-we-app-engine

<!--
Description here.
-->

## Install

```bash
$ npm i egg-we-app-engine --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.weAppEngine = {
  enable: true,
  package: 'egg-we-app-engine',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.weAppEngine = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
