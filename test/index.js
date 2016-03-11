/*jslint node: true */
/*global describe, it */
'use strict';

var expect = require('chai').expect;
var vizlint = require('../lib');

describe('vizlint', function () {
    it('should have a load method', function () {
        expect(vizlint.load).to.exist;
    });

    it('should return promise', function () {
        return vizlint.load()
            .then(function (result) {
                expect(result).to.equal('loaded');
            });
    });
});
