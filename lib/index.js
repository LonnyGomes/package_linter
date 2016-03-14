/*jslint node: true */
'use strict';
var q = require('q');
var fs = require('fs-extra');
var path = require('path');
var temp = require('temp');
var AdmZip = require('adm-zip');
var state = {};

function processPath(p) {
    var deferred = q.defer(),
        metadataPath = path.resolve(p, 'metadata.json');

    fs.stat(metadataPath, function (err, stats) {
        if (err) {
            deferred.reject('Failed to find metadata.json file: ' + metadataPath);
        } else {
            state.path = p;
            deferred.resolve('Successfully loaded ' + p);
        }
    });

    return deferred.promise;
}

function processPackage(p) {
    var deferred = q.defer(),
        zip;

    try {
        zip = new AdmZip(p);

        //create a temporary folder to store the zip file
        temp.mkdir('vizlint', function (err, tmpPath) {
            var metadataPath;

            if (err) {
                deferred.reject('Failed to create temporary folder: ' + err);
                return;
            }

            console.log('Extracting visual package ...');
            zip.extractAllTo(tmpPath);

            //now that that we're extracted, process path
            processPath(tmpPath)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (err) {
                    deferred.reject(err);
                });
        });
    } catch (e) {
        deferred.reject('Error while unzipping: ' + e);
    }

    return deferred.promise;
}

function parseMetadata(md, basePath) {
    var deferred = q.defer(),
        results = {
            msg: 'Valid package',
            errors: []
        };

    deferred.resolve(results);

    return deferred.promise;
}

function load(suppliedPathName) {
    var deferred = q.defer(),
        pathName;

    //make sure a path is supplied
    if (!suppliedPathName) {
        deferred.reject('a path was not supplied!');
        return deferred.promise;
    }

    //expand path
    pathName = path.resolve(suppliedPathName);

    //check if file exists
    fs.stat(pathName, function (err, stats) {
        var promise;

        if (err) {
            deferred.reject('the supplied path does not exist: ' + pathName);
        } else {
            if (stats.isDirectory()) {
                promise = processPath(pathName);
            } else {
                promise = processPackage(pathName);
            }

            promise.then(function (result) {
                deferred.resolve(result);
            }, function (err) {
                deferred.reject(err);
            });
        }
    });

    return deferred.promise;
}


exports.load = load;
