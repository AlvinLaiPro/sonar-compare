import { CompareOptions } from '../types';
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
export declare function sonarqubeCompare({ sourceBranch, targetBranch, metrics, component, token, host, }: CompareOptions): Promise<string[]>;
