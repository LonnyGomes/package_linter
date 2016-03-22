/*jslint node: true */
'use strict';
var q = require('q');
var tests;

var msgs = {
    MSG_SUCCESS: 'All required fields are properly defined!',
    ERR_TYPE_UNDEFINED: 'The required field "type" was not defined',
    ERR_TYPE_INVALID: 'The "type" field must be a string with a value of "interactive" or "static"',
    ERR_TARGET_UNDEFINED: 'The required field "target" was not defined',
    ERR_TARGET_INVALID: 'The "target" field must be a string with a value of "popup", "inline" or "modal"'
};

//All metadata tests are represented as an array of functions.
//Each function should accept a metadata obj and base path param
//and return a promise. If the promise is rejected, the reasons
//for failure should be returned within an array of strings

function testType(md, p) {
    var deferred = q.defer(),
        errors = [];

    //check for type field
    if (!md.type) {
        errors.push(msgs.ERR_TYPE_UNDEFINED);
    } else {
        if (md.type !== 'interactive' && md.type !== 'static') {
            errors.push(msgs.ERR_TYPE_INVALID);
        }
    }

    if (errors.length > 0) {
        deferred.reject(errors);
    } else {
        deferred.resolve(msgs.MSG_SUCCESS);
    }

    return deferred.promise;
}

function testTarget(md, p) {
    var deferred = q.defer(),
        errors = [];

    //check for target field
    if (!md.target) {
        errors.push(msgs.ERR_TARGET_UNDEFINED);
    } else {
        if (md.target !== 'popup' &&
                md.target !== 'inline' &&
                md.target !== 'modal') {
            errors.push(msgs.ERR_TARGET_INVALID);
        }
    }

    if (errors.length > 0) {
        deferred.reject(errors);
    } else {
        deferred.resolve(msgs.MSG_SUCCESS);
    }

    return deferred.promise;
}

function testFileLocations(md, p) {
    var deferred = q.defer();
    deferred.resolve('file location tests not implemented');
    return deferred.promise;
}

function testTypePopup(md, p) {
    var deferred = q.defer();
    deferred.resolve('popup tests not implemented');
    return deferred.promise;
}

function testTypeInline(md, p) {
    var deferred = q.defer();
    deferred.resolve('inline tests not implemented');
    return deferred.promise;
}

function testTypeModal(md, p) {
    var deferred = q.defer();
    deferred.resolve('modal tests not implemented');
    return deferred.promise;
}

exports.messages = msgs;
exports.testType = testType;
exports.testTarget = testTarget;
exports.testFileLocations = testFileLocations;
exports.testTypePopup = testTypePopup;
exports.testTypeInline = testTypeInline;
exports.testTypeModal = testTypeModal;

//export an array of all tests
exports.tests = [
    testType,
    testTarget,
    testFileLocations,
    testTypePopup,
    testTypeInline,
    testTypeModal
];
