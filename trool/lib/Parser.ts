/**
 * Convert string value in cells in corresponding code values.
 *
 * created by Sean Maxwell Mar 14, 2019
 */

class Parser {


    public static eval(cellVal: string): null | boolean | number | string {

        if (!isNaN(Number(cellVal))) {
            return Number(cellVal);
        } else if (cellVal === 'true') {
            return true;
        } else if (cellVal === 'false') {
            return false;
        } else if (cellVal.startsWith('"')  && cellVal.endsWith('"')) {
            return cellVal.substring(1, cellVal.length - 1);
        } else  {
            return null;
        }
    }
}

export default Parser;
