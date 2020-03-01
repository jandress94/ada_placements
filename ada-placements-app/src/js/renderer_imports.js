const fs = require("fs");
const { dialog } = require('electron').remote
const solver = require("javascript-lp-solver/src/solver");
const parse = require('csv-parse/lib/sync');
const { convertArrayToCSV } = require('convert-array-to-csv');
const {google} = require('googleapis');
const constants = require('../js/placement/constants');