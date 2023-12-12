#!/usr/bin/env node
require('ts-node/register');
const { sonarqubeCompare } = require('../src/index.ts');
const METRICS = ['uncovered_lines', 'uncovered_conditions', 'bugs', 'code_smells', 'VULNERABILITY'];

(() => {
    const yargs = require('yargs');
    const options = {
        sourceBranch: {
            alias: 's',
            describe: 'source branch',
            type: 'string',
        },
        targetBranch: {
            alias: 't',
            describe: 'target branch',
            type: 'string',
        },
        token: {
            alias: 'k',
            describe: 'sonarqube token',
            type: 'string',
        },
        component: {
            alias: 'c',
            describe: 'project id',
            type: 'string',
        },
        host: {
            alias: 'h',
            describe: 'sonarqube host',
            type: 'string',
        },
        metrics: {
            alias: 'm',
            describe: 'metrics to compare',
            type: 'array',
            choices: METRICS,
            default: ['uncovered_lines', 'uncovered_conditions'],
        },
    };
    const args = yargs
        .options(options)
        .strict()
        .wrap(yargs.terminalWidth())
        .completion()
        .usage('Usage: $0 -t targetBranch -s sourceBranch -k token -h host -c component')
        .demandOption(Object.keys(options))
        .argv;

    const { sourceBranch, targetBranch, token, component, host, metrics } = args;

    sonarqubeCompare({
        sourceBranch,
        targetBranch,
        token,
        component,
        host,
        metrics: metrics,
    }).then((res) => console.log(res.join('\n')));
})();
