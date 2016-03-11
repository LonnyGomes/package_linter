/*jslint node: true */
'use strict';
var q = require('q');
var AdmZip = require('adm-zip');

function load(pathName) {
    var deferred = q.defer();

    deferred.resolve('loaded');

    return deferred.promise;
}

exports.load = load;
