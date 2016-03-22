/*jslint node: true */
/*global describe, it, beforeEach, afterEach */
'use strict';

var expect = require('chai').expect;
var vizlint = require('../lib');
var coreTests = require('../lib/core-tests');
var msg = coreTests.messages;
var q = require('q');
var path = require('path');
var fs = require('fs-extra');
var fixtures = {
    noMdPath: 'test/fixtures/sample_no_md',
    sampleBare: 'test/fixtures/sample_bare',
    invalidPackage: 'test/fixtures/invalid.visual',
    noMdPackage: 'test/fixtures/sample_no_md.visual',
    sampleBarePackage: 'test/fixtures/sample_bare.visual',
    invalidMd: 'test/fixtures/sample_bare/metadata.json',
    missingReqMdPath: 'test/fixtures/sample_missing',
    tmpPackagePath: 'test/fixtures/tmp_package'
};
var genTestJSON = function (obj) {
    var jsonStr = JSON.stringify(obj),
        mdPath = path.resolve(fixtures.tmpPackagePath, 'metadata.json');

    fs.mkdirsSync(fixtures.tmpPackagePath);
    fs.writeFileSync(mdPath, jsonStr, 'utf8');
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

        it('should return the base path of the package', function () {
            return vizlint.load(fixtures.sampleBare)
                .then(function (packagePath) {
                    var fullPath = path.resolve(fixtures.sampleBare);
                    expect(packagePath).to.equal(fullPath);
                });
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

        it('should return the temporary path of the extracted package', function () {
            return vizlint.load(fixtures.sampleBarePackage)
                .then(function (packagePath) {
                    var mdPath = path.resolve(packagePath, 'metadata.json'),
                        pathStat = fs.statSync(packagePath),
                        mdStat = fs.statSync(mdPath);
                    expect(pathStat.isDirectory()).to.equal(true);
                    expect(mdStat.isFile()).to.equal(true);
                });
        });

        it('should notify when zip extration starts and ends', function () {
            var progressMgs = [];
            return vizlint.load(fixtures.sampleBarePackage)
                .then(function () {
                    expect(progressMgs.length).to.equal(2);
                    expect(progressMgs[0]).to.match(/^Started/);
                    expect(progressMgs[1]).to.match(/^Finished/);
                }, function (err) {
                    throw new Error('load method should not have failed');
                }, function (progress) {
                    progressMgs.push(progress);
                });
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
                    expect(result.errors[1]).to.equal('fail 2');
                    expect(result.errors[2]).to.equal('fail 3');
                    expect(result.errors[3]).to.equal('fail 4');
                    expect(result.errors[4]).to.equal('fail 5');
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

    describe('cleanup()', function () {
        beforeEach(function () {
            //remove contents of test package path
            fs.removeSync(fixtures.tmpPackagePath);
        });

        it('should fail supplied path is not a directory', function () {
            return vizlint.cleanup(fixtures.sampleBarePackage)
                .then(function (result) {
                    throw new Error('cleanup should have thrown an error if not a directory');
                }, function (err) {
                    //success
                    expect(err).to.match(/^Invalid path/);
                });
        });

        it('should fail if directory doesn\'t have a metadata.json file', function () {
            return vizlint.cleanup(fixtures.noMdPath)
                .then(function (result) {
                    throw new Error('cleanup should have thrown an error if not a directory');
                }, function (err) {
                    //success
                    expect(err).to.match(/^Invalid path/);
                });
        });

        it('should return the supplied package path', function () {
            genTestJSON({dummy: 'file'});
            return vizlint.cleanup(fixtures.tmpPackagePath)
                .then(function (result) {
                    var expectedPath = path.resolve(fixtures.tmpPackagePath);
                    expect(result).to.equal(expectedPath);
                });
        });

        it('should remove a valid extracted package path', function () {
            genTestJSON({dummy: 'file'});
            return vizlint.cleanup(fixtures.tmpPackagePath)
                .then(function (result) {
                    var expectedPath = path.resolve(fixtures.tmpPackagePath);

                    //statSync should throw an error if path doesn't exist
                    expect(function () {
                        fs.statSync(expectedPath);
                    }).to.throw(Error);
                });
        });
    });

    describe('core-tests', function () {
        describe('type field test', function () {
            afterEach(function () {
                //remove contents of test package path
                fs.removeSync(fixtures.tmpPackagePath);
            });

            it('should fail if not defined', function () {
                genTestJSON({typeA: 'static'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                        expect(result.errors[0]).to.equal(msg.ERR_TYPE_UNDEFINED);
                    });
            });

            it('should fail if invalid', function () {
                genTestJSON({type: 'invalid'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                        expect(result.errors[0]).to.equal(msg.ERR_TYPE_INVALID);
                    });
            });

            it('should pass if equals "static"', function () {
                genTestJSON({type: 'static'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "interactive"', function () {
                genTestJSON({type: 'interactive'});
                return vizlint.lint(fixtures.tmpPackagePath,  [coreTests.testType])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });
        });

        describe('target field test', function () {
            afterEach(function () {
                //remove contents of test package path
                fs.removeSync(fixtures.tmpPackagePath);
            });

            it('should fail if not defined', function () {
                genTestJSON({targetA: 'popup'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                        expect(result.errors[0]).to.equal(msg.ERR_TARGET_UNDEFINED);
                    });
            });

            it('should fail if invalid', function () {
                genTestJSON({target: 'invalid'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(1);
                        expect(result.errors[0]).to.equal(msg.ERR_TARGET_INVALID);
                    });
            });

            it('should pass if equals "popup"', function () {
                genTestJSON({target: 'popup'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "inline"', function () {
                genTestJSON({target: 'inline'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

            it('should pass if equals "modal"', function () {
                genTestJSON({target: 'modal'});
                return vizlint.lint(fixtures.tmpPackagePath, [coreTests.testTarget])
                    .then(function (result) {
                        expect(result.errors.length).to.equal(0);
                    });
            });

        });

    });
});
