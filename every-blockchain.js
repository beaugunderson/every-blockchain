#!/usr/bin/env node

'use strict';

var botUtilities = require('bot-utilities');
var fs = require('fs');
var Twit = require('twit');
var _ = require('lodash');

function getLines(filename) {
  return fs.readFileSync(filename, {encoding: 'utf8'}).split('\n');
}

var examples = getLines('./examples.txt');
var nouns = getLines('./nouns.txt');

function nounRegEx(noun) {
  return new RegExp(`(^|\\s)${noun}(\\s|$)`, 'i');
}

function blockchain(noun, text) {
  const re = nounRegEx(noun);
  const example = text.replace(re, '$1blockchain$2');

  return example.replace(/,$/, '');
}

function candidate() {
  var noun = _.sample(nouns);

  var possibleExamples = examples.filter(function (example) {
    return example.toLowerCase().indexOf(noun.toLowerCase()) !== -1;
  });

  var candidates = [];

  possibleExamples.forEach((example) => {
    candidates.push(blockchain(noun, example));
  });

  candidates = candidates.filter(function (example) {
    return example.indexOf('blockchain') !== -1 && example.length <= 140;
  });

  return _.sample(candidates);
}

const program = require('commander');

program
  .command('tweet')
  .description('Generate and tweet a sneme')
  .option('-r, --random', 'only post a percentage of the time')
  .action(botUtilities.randomCommand(function () {
    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    let status;

    do {
      status = candidate();
    } while (!status);

    T.post('statuses/update', {status: status},
      (err, data, response) => {
        if (err || response.statusCode !== 200) {
          console.log('Error sending tweet', err, response.statusCode);

          return;
        }

        console.log('Done.');
      });
  }));

program
  .command('candidates')
  .description('Generate candidates')
  .action(() => {
    const candidates = [];

    do {
      let c = candidate();

      if (c) {
        candidates.push(c);
      }
    } while (candidates.length < 25);

    candidates.forEach((c) => console.log(c));
  });

program.parse(process.argv);
