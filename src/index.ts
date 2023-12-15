import path from 'path';
import {
    CompareOptions,
    Component,
    ComponentResponse,
    ComponentTreeRequestParams,
    Issue,
    Metric,
    Source,
    SourceRequestParams,
    SourceResponse,
    TableCell,
    issueRequestParams,
} from '../types';
import { JSDOM } from 'jsdom';
import { table, Alignment, VerticalAlignment} from 'table';
import fetch, {type Response} from 'node-fetch';

const API_PATHS  = {
    SOURCES_LINES: '/api/sources/lines',
    MEASURES_COMPONENT_TREE: '/api/measures/component_tree',
    ISSUES_SEARCH: '/api/issues/search',
}

const COVERAGE_METRICS: Metric[] = ['uncovered_lines', 'uncovered_conditions'];
const ISSUE_METRICS: Metric[] = ['code_smells', 'bugs', 'VULNERABILITY', 'security_hotspots'];
const POSITIVE_METRICS = ['branch_coverage'];

const FILE_QUALIFIER = 'FIL';
const DefaultMetrics: Metric[] = ['uncovered_lines', 'uncovered_conditions'];
const METRIC_LABELS: Record<Metric, string> = {
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

async function getBranchIssues({ branch, component, token, host }: issueRequestParams): Promise<Issue[]> {
    const requestUrl = `${host}${API_PATHS.ISSUES_SEARCH}?branch=${branch}&componentKeys=${component}&ps=500&s=FILE_LINE&resolved=false`;

    const result = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res: Response) => res.json());

    return result.issues;
}

async function getBranchComponentByKey({ branch, key, token, host }: SourceRequestParams): Promise<Source[]> {
    const result: SourceResponse = await fetch(`${host}${API_PATHS.SOURCES_LINES}?branch=${branch}&key=${key}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res: Response) => res.json());

    return result.sources.map((source) => ({...source, code: removeTags(source.code)}));
}

async function getBranchComponentsWithMetricsByPage({
    branch,
    metrics,
    token,
    component,
    host,
    pageIndex,
}: ComponentTreeRequestParams & { pageIndex?: number }): Promise<ComponentResponse> {
    pageIndex = pageIndex ?? 1;
    const requestUrl = `${host}${API_PATHS.MEASURES_COMPONENT_TREE}?branch=${branch}&component=${component}&metricKeys=${metrics.join(
        ','
    )}&s=metric&qualifiers=${FILE_QUALIFIER}&metricSort=${metrics[0]}&ps=500&p=${pageIndex}`;

    return fetch(requestUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res: Response) => res.json());
}

async function getBranchComponentsWithMetrics(params: ComponentTreeRequestParams) {
    try {
        const {
            paging: { total, pageSize, pageIndex },
            components,
        } = await getBranchComponentsWithMetricsByPage(params);

        if (total <= pageSize) {
            return components;
        }
        const promises = [];
        for (let i = pageIndex + 1; i <= Math.ceil(total / pageSize); i++) {
            promises.push(getBranchComponentsWithMetricsByPage({ ...params, pageIndex: i }));
        }

        const results = await Promise.all(promises);
        const newComponents = results.flatMap((result) => result.components);

        return [...components, ...newComponents];
    } catch (error) {
        console.error(error);
        return [];
    }
}

function compareComponents(sourceComponents: Component[], targetComponents: Component[]) {
    const sourceKeys = sourceComponents
        .filter((component) => component.qualifier === FILE_QUALIFIER)
        .map((component) => component.key);
    const targetKeys = targetComponents.map((component) => component.key);
    const targetKeysWithoutExt = targetKeys.map((key) => key.replace(path.extname(key), ''));
    const filteredKeys = sourceKeys.filter(
        (key) => targetKeys.includes(key) || targetKeysWithoutExt.includes(key.replace(path.extname(key), ''))
    );

    const finalKeys = filteredKeys.filter((key) => {
        const { measures: sourceMeasures } = sourceComponents.find((component) => component.key === key)!;
        const { measures: targetMeasures } = targetComponents.find(
            (component) =>
                component.key === key ||
                component.key.replace(path.extname(component.key), '') === key.replace(path.extname(key), '')
        )!;

        if (sourceMeasures.every((item) => item.bestValue === true)) {
            return false;
        }

        return sourceMeasures.some(({ metric, value }) => {
            const targetMeasure = targetMeasures.find((measure) => measure.metric === metric);
            if (!targetMeasure) {
                return false;
            }
            const targetValue = targetMeasure.value;

            if (!POSITIVE_METRICS.includes(metric)) {
                return Number(value) > Number(targetValue);
            }

            return Number(value) < Number(targetValue);
        });
    });

    return finalKeys.map(
        (key) =>
            [
                key,
                targetComponents.find(
                    (component) =>
                        component.key === key ||
                        component.key.replace(path.extname(component.key), '') === key.replace(path.extname(key), '')
                )!.key,
            ] as const
    );
}

function removeTags(code: string) {
    if (code.includes('<span class')) {
        const dom = JSDOM.fragment(code);

        return dom.textContent ?? code;
    }
    return code;
}

function printCoverageTable(data: TableCell[][][], metrics: Metric[]) {
    if (data.length === 0) {
        return '';
    }
    let offset = 2;
    const config: {
        columns: { alignment: Alignment; width?: number, truncate?: number }[];
        spanningCells: { col: number; row: number; colSpan?: number, rowSpan?: number, verticalAlignment?: VerticalAlignment }[];
    } = {
        columns: [
          { alignment: 'center', width: 20 },
          { alignment: 'center', width: 5 },
          { alignment: 'left',width: 50, truncate: 50},
          { alignment: 'center', width: 10 },
          ...Array(metrics.length).fill({ alignment: 'center'}),
        ],
        spanningCells: [
          { col: 0, row: 0, colSpan: 4 + metrics.length },
          ...data.map((item, index) => {
            if (index > 0) {
                offset += data[index - 1].length;
                return {col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
            }
            return {col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle'};
        }) as {col: number, row: number, rowSpan: number, verticalAlignment: VerticalAlignment}[]
        ],
    };
    const flatData = data.flat();
    flatData.unshift(
        ['Test Coverage Report', '', '', '', ...Array(metrics.length).fill('')],
        ['Key', 'Line', 'Code', 'New code', ...metrics.map((metric) => METRIC_LABELS[metric])],
    );
    return table(flatData, config);
}

function printIssueTable(data: TableCell[][][]) {
    if (data.length === 0) {
        return '';
    }
    let offset = 2;const config: {
        columns: { alignment: Alignment; width?: number, truncate?: number }[];
        spanningCells: { col: number; row: number; colSpan?: number, rowSpan?: number, verticalAlignment?: VerticalAlignment }[];
    } = {
        columns: [
          { alignment: 'center', width: 20 },
          { alignment: 'center', width: 10 },
          { alignment: 'left',width: 60, truncate: 60},
          { alignment: 'center', width: 5 },
        ],
        spanningCells: [
          { col: 0, row: 0, colSpan: 4},
          ...data.map((item, index) => {
            if (index > 0) {
                offset += data[index - 1].length;
                return {col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle' };
            }
            return {col: 0, row: offset, rowSpan: item.length, verticalAlignment: 'middle'};
        }) as {col: number, row: number, rowSpan: number, verticalAlignment: VerticalAlignment}[]
        ],
    };
    const flatData = data.flat();
    flatData.unshift(
        ['Test Issue Report', '', '', ''],
        ['Key', 'Type', 'Description', 'Line',],
    );
    return table(flatData, config);

}

function getIssuePrintData(issues: Issue[]) {
    return issues.reduce((acc, {component, type, line, message}) => {
        const item = [component, type.replace('_', ' '), message, line];
        const targetItem = acc.find(item => item[0][0] === component);
        if (targetItem) {
            targetItem.push(item);
        } else {
            acc.push([item]);
        }
        return acc;
    }, [] as TableCell[][][]);
}

function getCoveragePrintData({ match, rest, key, metrics }: { match: Source[]; rest: Source[]; key: string; metrics: Metric[] }) {
    const result = [...match, ...rest].reduce((acc, {line, code, coveredConditions, conditions, lineHits, isNew}) => {
        const item = [acc.length ? '' : key, line, code.trim(), Boolean(isNew)];

        metrics.forEach((metric) => {
            if (metric === 'uncovered_conditions') {
                item.push(Number(coveredConditions) < Number(conditions) && lineHits !== 0 ? true : '');
            } else {
                item.push(lineHits === 0 ? true : '');
            }
        });
        acc.push(item);

        return acc;
    }, [] as (string | number | boolean)[][]);

    if (result.length === 0) {
        result.push([key, '', '', '', ...Array(metrics.length).fill('')]);
    }

    return result;
}

async function compareCoverageMetrics({ sourceBranch, targetBranch, component, token, host, metrics }: CompareOptions & { metrics: Metric[]}) {
    const sourceComponents = await getBranchComponentsWithMetrics({
        branch: sourceBranch,
        component,
        token,
        host,
        metrics,
    });
    const targetComponents = await getBranchComponentsWithMetrics({
        branch: targetBranch,
        component,
        token,
        host,
        metrics,
    });

    if (!sourceComponents.length || !targetComponents.length) {
        console.log('No need to compare');

        return '';
    }

    const results = compareComponents(sourceComponents, targetComponents);

    return Promise.all(
        results.map(async ([key, targetKey]) => {
            const source = await getBranchComponentByKey({
                branch: sourceBranch,
                key,
                token,
                host
            });
            const target = await getBranchComponentByKey({
                branch: targetBranch,
                key: targetKey,
                token,
                host
            });
            return compareSource(source, target, key, metrics);
        })
    ).then(res => printCoverageTable(res, metrics));
}

function compareIssues(sourceIssues: Issue[], targetIssues: Issue[], metrics: Metric[]) {
    const metricTypes = metrics.map(metric => metric.endsWith('s') ? metric.slice(0, -1).toUpperCase() : metric.toUpperCase());
    const filteredIssues = sourceIssues.filter(({hash, component, rule, message, type}) => {
        if (!metricTypes.includes(type)) {
            return false;
        }

        const targetIssue = targetIssues.find(issue => type === issue.type && hash === issue.hash && component === issue.component && rule === issue.rule && message === issue.message);

        return !targetIssue
    });

    if (filteredIssues.length === 0) {
        return '';
    }

    return printIssueTable(getIssuePrintData(filteredIssues));
}

async function compareIssueMetrics({ sourceBranch, targetBranch, component, token, host, metrics}: CompareOptions & { metrics: Metric[]}) {
    const sourceIssues = await getBranchIssues({
        branch: sourceBranch,
        component,
        token,
        host,
    });
    const targetIssues = await getBranchIssues({
        branch: targetBranch,
        component,
        token,
        host,
    });

    if (!sourceIssues.length || !targetIssues.length) {
        console.log('No need to compare');

        return '';
    }

    const results = compareIssues(sourceIssues, targetIssues, metrics);

    return results;
}

function compareSource(source: Source[], target: Source[], key: string, metrics: Metric[]) {
    const { match, rest } = source.reduce(
        (acc, source) => {
            const targetLine = target.find(
                ({ code, line, scmRevision }) =>
                    code === source.code &&
                    line === source.line &&
                    scmRevision === source.scmRevision
            );

            if (targetLine) {
                if (Number(source.lineHits) < Number(targetLine.lineHits) || Number(source.coveredConditions) < Number(targetLine.coveredConditions)) {
                    acc['match'].push(source);
                }
            } else if (
                Number(source.coveredConditions) < Number(source.conditions) ||
                ((source.lineHits ?? 1) === 0 && source.isNew)
                ) {
                acc['rest'].push(source);
            }

            return acc;
        },
        {
            match: [],
            rest: [],
        } as { match: Source[]; rest: Source[] }
    );
    return getCoveragePrintData({ match, rest, key, metrics });
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
 *  metrics: ['uncovered_lines', 'branch_coverage'],
 *  token: 'token',
 *  component: 'com.example:example',
 *  host: 'https://sonarqube.example.com',
 * })
 */
export async function sonarqubeCompare({
    sourceBranch,
    targetBranch,
    metrics,
    component,
    token,
    host,
}: CompareOptions): Promise<string[]> {
    metrics = metrics ?? DefaultMetrics;
    const issueMetrics = metrics?.filter((metric) => ISSUE_METRICS.includes(metric));
    const coverageMetrics = metrics?.filter((metric) => COVERAGE_METRICS.includes(metric));
    const result: string[] = [];

    if (issueMetrics?.length) {
        await compareIssueMetrics({
            sourceBranch,
            targetBranch,
            component,
            token,
            host,
            metrics: issueMetrics,
        }).then((res) => {
            result.push(res);
        });
    }

    if (coverageMetrics?.length) {
        await compareCoverageMetrics({
            sourceBranch,
            targetBranch,
            component,
            token,
            host,
            metrics: coverageMetrics,
        }).then((res) => {
            result.push(res);
        });
    }

    return result;
}
