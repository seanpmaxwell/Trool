import { IEngine } from './engine';
declare function trool(filePathOrContent: string, initFromString?: boolean, showLogs?: boolean): Promise<IEngine>;
export default trool;
