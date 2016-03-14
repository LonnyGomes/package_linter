/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('chai').expect;
var vizlint = require('../lib');
var fixtures = {
    noMdPath: 'test/fixtures/sample_no_md',
    sampleBare: 'test/fixtures/sample_bare',
    invalidPackage: 'test/fixtures/invalid.visual',
    noMdPackage: 'test/fixtures/sample_no_md.visual',
    sampleBarePackage: 'test/fixtures/sample_bare.visual',
    invalidMd: 'test/fixtures/sample_bare/metadata.json',
    missingReqMdPath: 'test/fixtures/sample_missing'
};

describe('vizlint', function () {
    describe('load()', function () {
        it('should exist', function () {
            expect(vizlint.load).to.exist;
        });

        it('should fail if no path is supplied', function () {
            return vizlint.load()
                .then(function () {
                    throw new Error('load should have thrown an error on no supplied path');
                }, function (err) {
                    //success
                });
        });

        it('should fail if invalid path is supplied', function () {
            return vizlint.load('invalid_file_that_doesnt_exist')
                .then(function () {
                    throw new Error('load should have thrown an error on invalid path');
                }, function (err) {
                    //success
                });
        });

        it('should fail if supplied path does not contain a metadata.json', function () {
            return vizlint.load(fixtures.noMdPath)
                .then(function () {
                    throw new Error('load should have thrown an error on invalid path');
                }, function (err) {
                    //success
                });
        });

        it('should accept a path with a metadata.json file', function () {
            return vizlint.load(fixtures.sampleBare);
        });

        it('should fail if visual package is not a zip file', function () {
            return vizlint.load(fixtures.invalidPackage)
                .then(function () {
                    throw new Error('load should have thrown an error on invalid path');
                }, function () {
                    //success
                });
        });

        it('should fail if supplied visual package does not contain a metadata.json', function () {
            return vizlint.load(fixtures.noMdPackage)
                .then(function () {
                    throw new Error('load should have thrown an error on invalid visual package');
                }, function (err) {

                });
        });

        it('should accept a visual package with a metadata.json file', function () {
            return vizlint.load(fixtures.sampleBarePackage);
        });
    });


});
