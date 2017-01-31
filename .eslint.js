/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const colors = require('colors');
const eslint = require('eslint').CLIEngine;

var filesToLint = [
    'chrome/background.js',
    'firefox/background.js',
    'firefox-mobile/background.js',
    'opera/background.js',
    '.eslint.js'
];

var lintConfig = new eslint({
    fix: true,
    useEslintrc: false,
    env: ['browser', 'es6'],
    extends: 'eslint:recommended',
    globals: [
        'chrome: true',
        'content: true',
        'Components: true',
        'XPCOMUtils: true',
        'CustomizableUI: true'
    ],
    rules: {
        'comma-dangle': 0,
        'curly': [2, 'all'],
        'eqeqeq': [2, 'smart'],
        'indent': [2, 2],
        'keyword-spacing': 2,
        'linebreak-style': [2, 'unix'],
        'new-cap': [2, {'newIsCap': true, 'capIsNew': false}],
        'no-cond-assign': 0,
        'no-spaced-func': 2,
        'no-use-before-define': 2,
        'no-unused-vars': ['error', { 'args': 'none' }],
        'no-useless-concat': 'error',
        'one-var': [2, 'never'],
        'prefer-template': 'error',
        'quotes': ['error', 'double'],
        'semi': [2, 'always'],
        'space-before-blocks': 2,
        'space-before-function-paren': [2, 'never'],
        'space-infix-ops': 2,
        'space-unary-ops': 2
    }
});

var lintReport = lintConfig.executeOnFiles(filesToLint);

function logToConsole(reporFile, saveChanges) {
    for (let i = 0; i < reporFile.results.length; ++i) {
        process.stdout.write(`${'['}\n`);
        process.stdout.write(` ${'Filepath: '.green} ${reporFile.results[i].filePath.bold.red}${','}\n`);
        process.stdout.write(` ${'Errors: '.green} ${reporFile.results[i].errorCount.toString().bold.magenta}${','}\n`);
        process.stdout.write(` ${'Warnings: '.green} ${reporFile.results[i].warningCount.toString().bold.blue}${','}\n`);
        for (let j = 0; j < reporFile.results[i].errorCount; ++j) {
            process.stdout.write(` ${'Error Message: '.green}${j.toString().green} ${reporFile.results[i].messages[j].message.bold.yellow}${','}\n`);
            process.stdout.write(` ${'Line, Column: '.green} ${'['}${reporFile.results[i].messages[j].line.toString().underline.cyan}${','}${reporFile.results[i].messages[j].column.toString().underline.cyan}${']'}\n`);
        }
        process.stdout.write(`${']'}\n`);
    }
    process.stdout.write(` ${'Changes saved to the disk: '.red}${saveChanges.toString().bold.yellow}\n`);

    if (saveChanges) {
        eslint.outputFixes(reporFile);
    }
}

if (process.env.npm_config_save && !process.env.npm_config_info) {
    logToConsole(lintReport, process.env.npm_config_save);
} else if (process.env.npm_config_info && !process.env.npm_config_save) {
    process.stdout.write(`${'Usage: npm run eslint [OPTION..]'}\n`);
    process.stdout.write(`${'--info'}                 ${'display this help and exit'}\n`);
    process.stdout.write(`${'--save'}                 ${'boolean flag for writing changes to the disk after linting'}\n`);
    process.stdout.write(`${'Report bugs to https://github.com/webcompat/webcompat-reporter-extensions/issues'}\n`);
} else if (process.env.npm_config_info && process.env.npm_config_save) {
    process.stdout.write(`${'Sorry, you cannot use both the command flags at the same time'}\n`);
} else if (!process.env.npm_config_info && !process.env.npm_config_save) {
    logToConsole(lintReport, false);
}
