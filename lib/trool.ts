/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import csvToJson from 'csvtojson';
import newEngine, { IEngine } from './engine';


/**
 * Get the rule engine.
 * 
 * @param filePathOrContent the path to a csv file or string formatted as csv.
 * @param initFromString set to true if initiating csv from string.
 * @param showLogs turn on console logging.
 * @returns 
 */
async function trool(
    filePathOrContent: string,
    initFromString?: boolean,
    showLogs?: boolean,
): Promise<IEngine> {
    const rows = await getRows(filePathOrContent, initFromString);
    return newEngine(!!showLogs, rows)
}

/**
 * Get an object array from either a csv file or a csv string.
 */
function getRows(filePathOrContent: string, initFromString?: boolean) {
    return initFromString ? csvToJson().fromString(filePathOrContent) : 
        csvToJson().fromFile(filePathOrContent);
}


// Export trool
export default trool;
