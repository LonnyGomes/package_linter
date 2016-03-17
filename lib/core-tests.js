/*jslint node: true */
'use strict';
var q = require('q');
var tests;

//All metadata tests are represented as an array of functions.
//Each function should accept a metadata obj and base path param
//and return a promise. If the promise is rejected, the reasons
//for failure should be returned within an array of strings

function testType(md, p) {
    var deferred = q.defer(),
        errors = [];

    //check for type field
    if (!md.type) {
        errors.push('The required field "type" was not defined');
    } else {
        if (md.type !== 'interactive' && md.type !== 'static') {
            errors.push('The "type" field must be a string with a value of "interactive" or "static"');
        }
    }

    if (errors.length > 0) {
        deferred.reject(errors);
    } else {
        deferred.resolve('All required fields are properly defined!');
    }

    return deferred.promise;
}

function testTarget(md, p) {
    var deferred = q.defer(),
        errors = [];

    //check for target field
    if (!md.target) {
        errors.push('The required field "target" was not defined');
    } else {
        if (md.target !== 'popup' &&
                md.target !== 'inline' &&
                md.target !== 'modal') {
            errors.push('The "target" field must be a string with a value of "popup", "inline" or "modal"');
        }
    }

    if (errors.length > 0) {
        deferred.reject(errors);
    } else {
        deferred.resolve('All required fields are properly defined!');
    }

    return deferred.promise;
}

function testFileLocations(md, p) {
    var deferred = q.defer();
    deferred.reject(['file location tests not implemented']);
    return deferred.promise;
}

function testTypePopup(md, p) {
    var deferred = q.defer();
    deferred.reject(['popup tests not implemented']);
    return deferred.promise;
}

function testTypeInline(md, p) {
    var deferred = q.defer();
    deferred.reject(['inline tests not implemented']);
    return deferred.promise;
}

function testTypeModal(md, p) {
    var deferred = q.defer();
    deferred.reject(['modal tests not implemented']);
    return deferred.promise;
}

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
