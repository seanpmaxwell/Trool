import { LoggerModes } from 'jet-logger';
import { IDecisionTable } from './decision-table';
declare let logger: {
    readonly settings: {
        readonly mode: LoggerModes;
        readonly filePath: string;
        readonly timestamp: boolean;
        readonly format: import("jet-logger").Formats;
        readonly customLogger: import("jet-logger").TCustomLogger | undefined;
    };
    readonly info: (this: any, content: any, printFull?: boolean | undefined) => void;
    readonly imp: (this: any, content: any, printFull?: boolean | undefined) => void;
    readonly warn: (this: any, content: any, printFull?: boolean | undefined) => void;
    readonly err: (this: any, content: any, printFull?: boolean | undefined) => void;
};
export declare type TPrimitive = boolean | number | null | string;
export declare type TObject = Record<string, any>;
export declare type TRow = {
    [key in `field${number}`]: string;
};
export declare type TFactsHolder = Record<string, TObject[]>;
export declare type TImportsHolder = Record<string, TObject>;
export declare type TImport = TImportsHolder[keyof TImportsHolder];
export declare type TFactsArr = TFactsHolder[keyof TFactsHolder];
export declare type TFact = TFactsArr[number];
export declare type TLogger = typeof logger;
export interface IEngine {
    csvImports: TImportsHolder;
    decisionTables: IDecisionTable[];
    applyRules: typeof applyRules;
}
declare function newEngine(showLogs: boolean, rows: any[]): {
    readonly csvImports: TImportsHolder;
    readonly decisionTables: IDecisionTable[];
    readonly applyRules: typeof applyRules;
};
declare function applyRules<T extends TObject>(this: IEngine, factsHolder: T, memImports?: TImportsHolder): T;
export default newEngine;
