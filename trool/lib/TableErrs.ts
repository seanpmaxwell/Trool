/**
 *
 *
 * created by Sean Maxwell Mar 18, 2019
 */

class TableErrs {

    private readonly COL_HEADER = 'Action/Condition column headers can only be "Condition" ' +
        'or "Action".';

    private readonly COL_HEADER_ARGMT = 'All conditions must specified before all actions';

    private readonly COL_LENGTH = 'The number of Action/Condition column headers must match ' +
        'and line up with the number of operations.';

    private readonly COND_BLANK = 'Condition cannot be blank';

    private readonly OP_FORMAT = 'The operation must began with the Fact\'s attribute, contain ' +
        'one operators, and end with "$param".';

    private readonly ATTR_UNDEF = 'Attribute does not not exist on the fact for condition: ';

    private readonly MUST_END_WITH_PARAM = 'Condition operation must end with "$param"';

    private readonly PARAM_COUNT = 'The number of params for an action operation ' +
        'must match the number of argument for the method: ';

    private readonly ASSIGN_PARAM_COUNT = 'An assignment action operation can only contain ' +
        'one argument ';

    private readonly RULE_NAME_EMPTY = 'The rule name (first cell for a rule row for a decision ' +
        'table) cannot be empty.';

    private readonly NOT_AN_OP = 'The following operator is not a comparison operator: ';


    private readonly id: string;


    constructor(id: number) {
        this.id = 'Error on DecisionTable ' + id + ': ';
    }


    public attrUndef(opStr: string): string {
        return this.id + this.ATTR_UNDEF + opStr;
    }


    public static getStartCellErr(id: number): string {
        return `Decision Table ${id} start cell must contain "Start:" and specify 1 and ` +
            'only 1 fact.';
    }


    public static getFactFalseyErr(id: number): string {
        return `The fact specified in the start cell for Decision Table ${id} was not present ` +
            'or is null. Please use and instance-object or an array of instances-objects as ' +
            'a fact value.';
    }


    public invalidVal(id: number, cellVal: string) {
        return 'Value ' + cellVal + ' provided in table ' + id + ' provided was not a ' +
            'null, boolean, number, string, or import';
    }


    get colHeader(): string {
        return this.id + this.COL_HEADER;
    }

    get colHeaderArgmt(): string {
        return this.id + this.COL_HEADER_ARGMT;
    }

    get colLenth(): string {
        return this.id + this.COL_LENGTH;
    }

    get condBlank(): string {
        return this.id + this.COND_BLANK;
    }

    get opFormat(): string {
        return this.id + this.OP_FORMAT;
    }

    get mustEndWithParam(): string {
        return this.id + this.MUST_END_WITH_PARAM;
    }

    get paramCount(): string {
        return this.id + this.PARAM_COUNT;
    }

    get ruleNameEmpty(): string {
        return this.id + this.RULE_NAME_EMPTY;
    }

    get assignParamCount(): string {
        return this.id + this.ASSIGN_PARAM_COUNT;
    }

    get notAnOperator(): string {
        return this.id + this.NOT_AN_OP;
    }
}

export default TableErrs;
