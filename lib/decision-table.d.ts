import { TFact, TLogger, TPrimitive, TRow } from './engine';
export declare type TCondition = (fact: TFact, paramVal: any) => boolean;
export declare type TAction = (fact: TFact, cellVals: TPrimitive[]) => void;
export interface IDecisionTable {
    factName: string;
    tableRows: TRow[];
    logger: TLogger;
    conditions: TCondition[];
    actions: TAction[];
}
export declare function getNewDecisionTbl(factName: string, tableRows: TRow[], logger: TLogger): IDecisionTable;
export declare function rowToArr(row: TRow): string[];
