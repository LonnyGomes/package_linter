/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('chai').expect;
var vizlint = require('../lib');
var coreTests = require('../lib/core-tests');
var q = require('q');
var fixtures = {
    noMdPath: 'test/fixtures/sample_no_md',
    sampleBare: 'test/fixtures/sample_bare',
    invalidPackage: 'test/fixtures/invalid.visual',
    noMdPackage: 'test/fixtures/sample_no_md.visual',
    sampleBarePackage: 'test/fixtures/sample_bare.visual',
    invalidMd: 'test/fixtures/sample_bare/metadata.json',
    missingReqMdPath: 'test/fixtures/sample_missing',
    typeNoPath: 'test/fixtures/type/type_missing',
    typeInvalidPath: 'test/fixtures/type/type_invalid',
    typeStaticPath: 'test/fixtures/type/type_static',
    typeIntPath: 'test/fixtures/type/type_interactive',
    targetNoPath: 'test/fixtures/target/target_missing',
    targetInvalidPath: 'test/fixtures/target/target_invalid',
    targetPopupPath: 'test/fixtures/target/target_popup',
    targetInlinePath: 'test/fixtures/target/target_inline',
    targetModalPath: 'test/fixtures/target/target_modal'
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

    describe('lint()', function () {
        it('should fail if metadata.json is not a valid JSON file', function () {
            return vizlint.lint(fixtures.invalidMd)
                .then(function () {
                    throw new Error('lint should have thrown an error on invalid path');
                }, function (err) {
                    //success
                });
        });

        it('should fail if metadata.json does not exist', function () {
            return vizlint.lint(fixtures.invalidMd)
                .then(function () {
                    throw new Error('lint should have thrown an error on no metadata.json');
                }, function (err) {
                    //success
                });
        });

        it('should resolve promise and return an object if metadata was read', function () {
            return vizlint.lint(fixtures.missingReqMdPath)
                .then(function (result) {
                    expect(result).to.include.keys('msg');
                    expect(result).to.include.keys('errors');
                });
        });

        it('should return an array of errors if tests fail', function () {
            var tests = [
                function (md, p) {
                    var d = q.defer();
                    d.reject(['fail 1', 'fail 2']);
                    return d.promise;
                },
                function (md, p) {
                    var d = q.defer();
                    d.reject(['fail 3']);
                    return d.promise;
                },
                function (md, p) {
                    var d = q.defer();
                    d.reject(['fail 4', 'fail 5', 'fail 6']);
                    return d.promise;
                }
            ];

            return vizlint.lint(fixtures.missingReqMdPath, tests)
                .then(function (result) {
                    expect(result.errors.length).to.equal(6);
                    expect(result.errors[0]).to.equal('fail 1');
                    expect(result.errors[5]).to.equal('fail 6');
                });

        });

        it('should return an empty error list if all tests pass', function () {
            var tests = [
                function (md, p) {
                    var d = q.defer();
                    d.resolve('pass 1');
                    return d.promise;
                },
                function (md, p) {
                    var d = q.defer();
                    d.resolve('pass 2');
                    return d.promise;
                }
            ];

            return vizlint.lint(fixtures.missingReqMdPath, tests)
                .then(function (result) {
                    expect(result.errors.length).to.equal(0);
                });

        });
    });

    describe('core-tests', function () {
        describe('type field test', function () {
            it('should fail if not defined', function () {
                return vizlint.lint(fixtures.typeNoPath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                    });
            });

            it('should fail if invalid', function () {
                return vizlint.lint(fixtures.typeInvalidPath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                    });
            });

            it('should pass if equals "static"', function () {
                return vizlint.lint(fixtures.typeStaticPath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "interactive"', function () {
                return vizlint.lint(fixtures.typeIntPath,  [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

        });

        describe('target field test', function () {
            it('should fail if not defined', function () {
                return vizlint.lint(fixtures.targetNoPath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                    });
            });

            it('should fail if invalid', function () {
                return vizlint.lint(fixtures.targetInvalidPath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                    });
            });

            it('should pass if equals "popup"', function () {
                return vizlint.lint(fixtures.targetPopupPath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "inline"', function () {
                return vizlint.lint(fixtures.targetInlinePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "modal"', function () {
                return vizlint.lint(fixtures.targetModalPath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

        });

    });
});
