"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sonarqubeCompare = void 0;
var path_1 = __importDefault(require("path"));
var jsdom_1 = require("jsdom");
var table_1 = require("table");
var node_fetch_1 = __importDefault(require("node-fetch"));
var API_PATHS = {
    SOURCES_LINES: '/api/sources/lines',
    MEASURES_COMPONENT_TREE: '/api/measures/component_tree',
    ISSUES_SEARCH: '/api/issues/search',
};
var COVERAGE_METRICS = ['uncovered_lines', 'uncovered_conditions'];
var ISSUE_METRICS = ['code_smells', 'bugs', 'VULNERABILITY', 'security_hotspots'];
var POSITIVE_METRICS = ['branch_coverage'];
var FILE_QUALIFIER = 'FIL';
var DefaultMetrics = ['uncovered_lines', 'uncovered_conditions'];
var METRIC_LABELS = {
    code_smells: 'Code Smells',
    uncovered_lines: 'Uncovered Lines',
    uncovered_conditions: 'Uncovered Conditions (Fully)',
    duplicated_lines: 'Duplicated Lines',
    duplicated_blocks: 'Duplicated Blocks',
    branch_coverage: 'Branch Coverage',
    bugs: 'Bugs',
    VULNERABILITY: 'Vulnerabilities',
    security_hotspots: 'Security Hotspots',
};
function getBranchIssues(_a) {
    var branch = _a.branch, component = _a.component, token = _a.token, host = _a.host;
    return __awaiter(this, void 0, void 0, function () {
        var requestUrl, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    requestUrl = "".concat(host).concat(API_PATHS.ISSUES_SEARCH, "?branch=").concat(branch, "&componentKeys=").concat(component, "&ps=500&s=FILE_LINE&resolved=false");
                    return [4 /*yield*/, (0, node_fetch_1.default)(requestUrl, {
                            method: 'GET',
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        }).then(function (res) { return res.json(); })];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, result.issues];
            }
        });
    });
}
function getBranchComponentByKey(_a) {
    var branch = _a.branch, key = _a.key, token = _a.token, host = _a.host;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)("".concat(host).concat(API_PATHS.SOURCES_LINES, "?branch=").concat(branch, "&key=").concat(key), {
                        method: 'GET',
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    }).then(function (res) { return res.json(); })];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, result.sources.map(function (source) { return (__assign(__assign({}, source), { code: removeTags(source.code) })); })];
            }
        });
    });
}
function getBranchComponentsWithMetricsByPage(_a) {
    var branch = _a.branch, metrics = _a.metrics, token = _a.token, component = _a.component, host = _a.host, pageIndex = _a.pageIndex;
    return __awaiter(this, void 0, void 0, function () {
        var requestUrl;
        return __generator(this, function (_b) {
            pageIndex = pageIndex !== null && pageIndex !== void 0 ? pageIndex : 1;
            requestUrl = "".concat(host).concat(API_PATHS.MEASURES_COMPONENT_TREE, "?branch=").concat(branch, "&component=").concat(component, "&metricKeys=").concat(metrics.join(','), "&s=metric&qualifiers=").concat(FILE_QUALIFIER, "&metricSort=").concat(metrics[0], "&ps=500&p=").concat(pageIndex);
            return [2 /*return*/, (0, node_fetch_1.default)(requestUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: "Bearer ".concat(token),
                    },
                }).then(function (res) { return res.json(); })];
        });
    });
}
function getBranchComponentsWithMetrics(params) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, total, pageSize, pageIndex, components, promises, i, results, newComponents, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getBranchComponentsWithMetricsByPage(params)];
                case 1:
                    _a = _c.sent(), _b = _a.paging, total = _b.total, pageSize = _b.pageSize, pageIndex = _b.pageIndex, components = _a.components;
                    if (total <= pageSize) {
                        return [2 /*return*/, components];
                    }
                    promises = [];
                    for (i = pageIndex + 1; i <= Math.ceil(total / pageSize); i++) {
                        promises.push(getBranchComponentsWithMetricsByPage(__assign(__assign({}, params), { pageIndex: i })));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    results = _c.sent();
                    newComponents = results.flatMap(function (result) { return result.components; });
                    return [2 /*return*/, __spreadArray(__spreadArray([], components, true), newComponents, true)];
                case 3:
                    error_1 = _c.sent();
                    console.error(error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function compareComponents(sourceComponents, targetComponents) {
    var sourceKeys = sourceComponents
        .filter(function (component) { return component.qualifier === FILE_QUALIFIER; })
        .map(function (component) { return component.key; });
    var targetKeys = targetComponents.map(function (component) { return component.key; });
    var targetKeysWithoutExt = targetKeys.map(function (key) { return key.replace(path_1.default.extname(key), ''); });
    var filteredKeys = sourceKeys.filter(function (key) { return targetKeys.includes(key) || targetKeysWithoutExt.includes(key.replace(path_1.default.extname(key), '')); });
    var finalKeys = filteredKeys.filter(function (key) {
        var sourceMeasures = sourceComponents.find(function (component) { return component.key === key; }).measures;
        var targetMeasures = targetComponents.find(function (component) {
            return component.key === key ||
                component.key.replace(path_1.default.extname(component.key), '') === key.replace(path_1.default.extname(key), '');
        }).measures;
        if (sourceMeasures.every(function (item) { return item.bestValue === true; })) {
            return false;
        }
        return sourceMeasures.some(function (_a) {
            var metric = _a.metric, value = _a.value;
            var targetMeasure = targetMeasures.find(function (measure) { return measure.metric === metric; });
            if (!targetMeasure) {
                return false;
            }
            var targetValue = targetMeasure.value;
            if (!POSITIVE_METRICS.includes(metric)) {
                return Number(value) > Number(targetValue);
            }
            return Number(value) < Number(targetValue);
        });
    });
    return finalKeys.map(function (key) {
        return [
            key,
            targetComponents.find(function (component) {
                return component.key === key ||
                    component.key.replace(path_1.default.extname(component.key), '') === key.replace(path_1.default.extname(key), '');
            }).key,
        ];
    });
}
function removeTags(code) {
    var _a;
    if (code.includes('<span class')) {
        var dom = jsdom_1.JSDOM.fragment(code);
        return (_a = dom.textContent) !== null && _a !== void 0 ? _a : code;
    }
    return code;
}
function printCoverageTable(data, metrics) {
    if (data.length === 0) {
        return '';
    }
    var offset = 2;
    var config = {
        columns: __spreadArray([
            { alignment: 'center', width: 20 },
            { alignment: 'center', width: 5 },
            { alignment: 'left', width: 50, truncate: 50 },
            { alignment: 'center', width: 10 }
        ], Array(metrics.length).fill({ alignment: 'center' }), true),
        spanningCells: __spreadArray([
            { col: 0, row: 0, colSpan: 4 + metrics.length }
        ], data.map(function (item, index) {
            if (index > 0) {
                offset += data[index - 1].length;
                return { col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
            }
            return { col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
        }), true),
    };
    var flatData = data.flat();
    flatData.unshift(__spreadArray(['Test Coverage Report', '', '', ''], Array(metrics.length).fill(''), true), __spreadArray(['Key', 'Line', 'Code', 'New code'], metrics.map(function (metric) { return METRIC_LABELS[metric]; }), true));
    return (0, table_1.table)(flatData, config);
}
function printIssueTable(data) {
    if (data.length === 0) {
        return '';
    }
    var offset = 2;
    var config = {
        columns: [
            { alignment: 'center', width: 20 },
            { alignment: 'center', width: 10 },
            { alignment: 'left', width: 60, truncate: 60 },
            { alignment: 'center', width: 5 },
        ],
        spanningCells: __spreadArray([
            { col: 0, row: 0, colSpan: 4 }
        ], data.map(function (item, index) {
            if (index > 0) {
                offset += data[index - 1].length;
                return { col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
            }
            return { col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
        }), true),
    };
    var flatData = data.flat();
    flatData.unshift(['Test Issue Report', '', '', ''], ['Key', 'Type', 'Description', 'Line',]);
    return (0, table_1.table)(flatData, config);
}
function getIssuePrintData(issues) {
    return issues.reduce(function (acc, _a) {
        var component = _a.component, type = _a.type, line = _a.line, message = _a.message;
        var item = [component, type.replace('_', ' '), message, line];
        var targetItem = acc.find(function (item) { return item[0][0] === component; });
        if (targetItem) {
            targetItem.push(item);
        }
        else {
            acc.push([item]);
        }
        return acc;
    }, []);
}
function getCoveragePrintData(_a) {
    var match = _a.match, rest = _a.rest, key = _a.key, metrics = _a.metrics;
    var result = __spreadArray(__spreadArray([], match, true), rest, true).reduce(function (acc, _a) {
        var line = _a.line, code = _a.code, coveredConditions = _a.coveredConditions, conditions = _a.conditions, lineHits = _a.lineHits, isNew = _a.isNew;
        var item = [acc.length ? '' : key, line, code.trim(), Boolean(isNew)];
        metrics.forEach(function (metric) {
            if (metric === 'uncovered_conditions') {
                item.push(Number(coveredConditions) < Number(conditions) && lineHits !== 0 ? true : '');
            }
            else {
                item.push(lineHits === 0 ? true : '');
            }
        });
        acc.push(item);
        return acc;
    }, []);
    if (result.length === 0) {
        result.push(__spreadArray([key, '', '', ''], Array(metrics.length).fill(''), true));
    }
    return result;
}
function compareCoverageMetrics(_a) {
    var sourceBranch = _a.sourceBranch, targetBranch = _a.targetBranch, component = _a.component, token = _a.token, host = _a.host, metrics = _a.metrics;
    return __awaiter(this, void 0, void 0, function () {
        var sourceComponents, targetComponents, results;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getBranchComponentsWithMetrics({
                        branch: sourceBranch,
                        component: component,
                        token: token,
                        host: host,
                        metrics: metrics,
                    })];
                case 1:
                    sourceComponents = _b.sent();
                    return [4 /*yield*/, getBranchComponentsWithMetrics({
                            branch: targetBranch,
                            component: component,
                            token: token,
                            host: host,
                            metrics: metrics,
                        })];
                case 2:
                    targetComponents = _b.sent();
                    if (!sourceComponents.length || !targetComponents.length) {
                        console.log('No need to compare');
                        return [2 /*return*/, ''];
                    }
                    results = compareComponents(sourceComponents, targetComponents);
                    return [2 /*return*/, Promise.all(results.map(function (_a) {
                            var key = _a[0], targetKey = _a[1];
                            return __awaiter(_this, void 0, void 0, function () {
                                var source, target;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, getBranchComponentByKey({
                                                branch: sourceBranch,
                                                key: key,
                                                token: token,
                                                host: host
                                            })];
                                        case 1:
                                            source = _b.sent();
                                            return [4 /*yield*/, getBranchComponentByKey({
                                                    branch: targetBranch,
                                                    key: targetKey,
                                                    token: token,
                                                    host: host
                                                })];
                                        case 2:
                                            target = _b.sent();
                                            return [2 /*return*/, compareSource(source, target, key, metrics)];
                                    }
                                });
                            });
                        })).then(function (res) { return printCoverageTable(res, metrics); })];
            }
        });
    });
}
function compareIssues(sourceIssues, targetIssues, metrics) {
    var metricTypes = metrics.map(function (metric) { return metric.endsWith('s') ? metric.slice(0, -1).toUpperCase() : metric.toUpperCase(); });
    var filteredIssues = sourceIssues.filter(function (_a) {
        var hash = _a.hash, component = _a.component, rule = _a.rule, message = _a.message, type = _a.type;
        if (!metricTypes.includes(type)) {
            return false;
        }
        var targetIssue = targetIssues.find(function (issue) { return type === issue.type && hash === issue.hash && component === issue.component && rule === issue.rule && message === issue.message; });
        return !targetIssue;
    });
    if (filteredIssues.length === 0) {
        return '';
    }
    return printIssueTable(getIssuePrintData(filteredIssues));
}
function compareIssueMetrics(_a) {
    var sourceBranch = _a.sourceBranch, targetBranch = _a.targetBranch, component = _a.component, token = _a.token, host = _a.host, metrics = _a.metrics;
    return __awaiter(this, void 0, void 0, function () {
        var sourceIssues, targetIssues, results;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getBranchIssues({
                        branch: sourceBranch,
                        component: component,
                        token: token,
                        host: host,
                    })];
                case 1:
                    sourceIssues = _b.sent();
                    return [4 /*yield*/, getBranchIssues({
                            branch: targetBranch,
                            component: component,
                            token: token,
                            host: host,
                        })];
                case 2:
                    targetIssues = _b.sent();
                    if (!sourceIssues.length || !targetIssues.length) {
                        console.log('No need to compare');
                        return [2 /*return*/, ''];
                    }
                    results = compareIssues(sourceIssues, targetIssues, metrics);
                    return [2 /*return*/, results];
            }
        });
    });
}
function compareSource(source, target, key, metrics) {
    var _a = source.reduce(function (acc, source) {
        var _a;
        var targetLine = target.find(function (_a) {
            var code = _a.code, line = _a.line, scmRevision = _a.scmRevision;
            return code === source.code &&
                line === source.line &&
                scmRevision === source.scmRevision;
        });
        if (targetLine) {
            if (Number(source.lineHits) < Number(targetLine.lineHits) || Number(source.coveredConditions) < Number(targetLine.coveredConditions)) {
                acc['match'].push(source);
            }
        }
        else if (Number(source.coveredConditions) < Number(source.conditions) ||
            (((_a = source.lineHits) !== null && _a !== void 0 ? _a : 1) === 0 && source.isNew)) {
            acc['rest'].push(source);
        }
        return acc;
    }, {
        match: [],
        rest: [],
    }), match = _a.match, rest = _a.rest;
    return getCoveragePrintData({ match: match, rest: rest, key: key, metrics: metrics });
}
/**
 * compare sonarqube metrics between two branches
 * @param sourceBranch - source branch name
 * @param targetBranch - target branch name
 * @param metrics - metrics to compare, default is ['uncovered_lines', 'uncovered_conditions']
 * @param component - component key
 * @param token - sonarqube token
 * @param host - sonarqube host
 * @returns {Promise<string>}
 * @example
 * sonarqubeCompare({
 *  sourceBranch: 'develop',
 *  targetBranch: 'master',
 * metrics: ['uncovered_lines', 'branch_coverage'],
 * component: 'com.example:example',
 * host: 'https://sonarqube.example.com',
 * })
 */
function sonarqubeCompare(_a) {
    var sourceBranch = _a.sourceBranch, targetBranch = _a.targetBranch, metrics = _a.metrics, component = _a.component, token = _a.token, host = _a.host;
    return __awaiter(this, void 0, void 0, function () {
        var issueMetrics, coverageMetrics, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    metrics = metrics !== null && metrics !== void 0 ? metrics : DefaultMetrics;
                    issueMetrics = metrics === null || metrics === void 0 ? void 0 : metrics.filter(function (metric) { return ISSUE_METRICS.includes(metric); });
                    coverageMetrics = metrics === null || metrics === void 0 ? void 0 : metrics.filter(function (metric) { return COVERAGE_METRICS.includes(metric); });
                    result = [];
                    if (!(issueMetrics === null || issueMetrics === void 0 ? void 0 : issueMetrics.length)) return [3 /*break*/, 2];
                    return [4 /*yield*/, compareIssueMetrics({
                            sourceBranch: sourceBranch,
                            targetBranch: targetBranch,
                            component: component,
                            token: token,
                            host: host,
                            metrics: issueMetrics,
                        }).then(function (res) {
                            result.push(res);
                        })];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    if (!(coverageMetrics === null || coverageMetrics === void 0 ? void 0 : coverageMetrics.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, compareCoverageMetrics({
                            sourceBranch: sourceBranch,
                            targetBranch: targetBranch,
                            component: component,
                            token: token,
                            host: host,
                            metrics: coverageMetrics,
                        }).then(function (res) {
                            result.push(res);
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
exports.sonarqubeCompare = sonarqubeCompare;
