#!/usr/bin/env node
/*jslint node: true */
'use strict';
var meow = require('meow');
var vizlint = require('./');
var path = require('path');
var cli = meow([
    'Usage',
    '  $ vizlint [input]',
    '',
    'Options',
    '  -v, --verbose extended output',
    '  --foo  Lorem ipsum. [Default: false]',
    '',
    'Examples',
    '  $ vizlint package/path/ -v',
    '  package verified!',
    '  $ vizlint crud.visual --verbose',
    '  package verified!'
], {
    alias: {
        v: 'verbose'
    }
});

var inputPath;

//check to make sure a path to the filename is supplied
if (!cli.input[0]) {
    console.log('Invalid parameters!\n');
    cli.showHelp();
    //showHelp exits
} else {
    inputPath = cli.input[0];
}

vizlint.load(inputPath)
    .then(function (packagePath) {
        return vizlint.lint(packagePath).then(function (result) {
            var extName = path.extname(inputPath);

            if (result.errors.length > 0) {

                console.log('Encountered errors:');
                result.errors.forEach(function (curErr) {
                    console.log('- ' + curErr);
                });

                //quit with a failure exit code as a true CLI should
                process.exit(1);
            } else {
                if (cli.flags.verbose) {
                    console.log('package verified!');
                }
            }

            if (extName.match(/\.visual/g)) {
                //since the input was a package, clean out the extracted path
                return vizlint.cleanup(packagePath);
            } else {
                return packagePath;
            }
        });
    })
    .progress(function (progress) {
        if (cli.flags.verbose) {
            console.log('* ', progress);
        }
    })
    .fail(function (err) {
        console.error('Error: ', err);
        //quit with a failure exit code as a true CLI should
        process.exit(1);
    });
