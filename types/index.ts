export type Source = {
    line: number;
    code: string;
    scmRevision?: string;
    scmAuthor?: string;
    scmDate?: string;
    duplicated?: boolean;
    isNew?: boolean;
    utLineHits?: number;
    lineHits?: number;
    utCoveredConditions?: number;
    coveredConditions?: number;
    conditions?: number;
}

export type Metric = 'code_smells' | 'uncovered_lines' | 'uncovered_conditions' | 'duplicated_lines' | 'duplicated_blocks' | 'branch_coverage' | 'bugs' | 'VULNERABILITY' | 'security_hotspots';

export type Measure = {
    metric: Metric;
    value: string;
    bestValue?: boolean;
}

export type Component = {
    key: string;
    name: string;
    qualifier: string;
    path: string;
    language: string;
    measures: Measure[];
    branch?: string;
}

export type CompareOptions = {
    token: string;
    sourceBranch: string;
    targetBranch: string;
    metrics?: Metric[];
    component: string;
    host: URL | string;
}

export type ComponentResponse = {
    components: Component[];
    paging: {
        pageIndex: number;
        pageSize: number;
        total: number;
    }
}

export type SourceResponse = {
    sources: Source[];
}

type TextRange = {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
}

export type Issue = {
    key: string;
    rule: string;
    severity: string;
    component: string;
    project: string;
    line: number;
    hash: string;
    textRange: TextRange;
    flows: string[];
    status: string;
    message: string;
    effort: string;
    debt?: string;
    author: string;
    tags: string[];
    creationDate: string;
    updateDate: string;
    type: string;
    branch: string;
    scope: string;
}

export type ComponentTreeRequestParams = Pick<CompareOptions, 'token' |'component' | 'host'> & {branch: string; metrics: Metric[]};

export type issueRequestParams = Pick<CompareOptions, 'token' |'component' | 'host'> & {branch: string};

export type SourceRequestParams = Pick<CompareOptions, 'token' | 'host'> & {branch: string; key: string};

export type TableCell = string | number | boolean;
