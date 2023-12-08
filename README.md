# sonarqube-compare
With sonarqube-compare, you can compare your new branch against the target branch's coverage and issues in detail.

## Installation

sonarqube-compare runs on Node.js and is available as a NPM package.

```bash
npm install sonarqube-compare
```
or 
```
npm install sonarqube-compare -g
```

## Usage

To generate the comparison of your code coverage between two branchs, you need to provide these parameters for the `sonarqubeCompare` function: `sourceBranch`, `targetBranch`, `component`, `token`, `metrics`, `sourceLineUrl` and `componentTreeUrl`. The `metrics` parameter is optional, it would be set to `['uncovered_lines', 'uncovered_conditions']` if you don't provide it.

```js
const {sonarqubeCompare} = require('sonarqube-compare');

sonarqubeCompare({
    sourceBranch: 'develop',
    targetBranch: 'master',
    metrics: ['uncovered_lines', 'uncovered_conditions'],
    component: 'your_project_key',
    host: 'https://sonarqube.example.com',
}).then(s => console.log(s));
```
Command line support is also available. For command line use, we recommend installing it globally.

```bash
sonarqube-compare -s develop -t master -c your_project_key -k token -h https://sonarqube.example.com -m uncovered_lines uncovered_conditions
```
