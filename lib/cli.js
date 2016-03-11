#!/usr/bin/env node
'use strict';
var meow = require('meow');
var asdfFda = require('./');

var cli = meow([
  'Usage',
  '  $ asdf-fda [input]',
  '',
  'Options',
  '  --foo  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ asdf-fda',
  '  unicorns',
  '  $ asdf-fda rainbows',
  '  unicorns & rainbows'
]);
