#!/usr/bin/env node
const chromeLaunch = require('chrome-launch'); // eslint-disable-line import/no-extraneous-dependencies
const url = 'https://webcompat.com/'; // this can be any url, we can also pass through the command line
const args = ['--load-extension=./dist/chrome'];
chromeLaunch(url, { args });
console.log('A new instance of Chrome should now be open in the background.');
