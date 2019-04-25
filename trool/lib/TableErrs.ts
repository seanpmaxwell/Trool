/**
 * There are so many errors to check the format of the Decision Table
 * they have all been moved here.
 *
 * created by Sean Maxwell Mar 18, 2019
 */


class TableErrs {

    private readonly START_CELL = "First cell must contain \"Table:\" and specify 1 and only 1 " +
        "fact.";

    private readonly FACT_FALSEY = "The fact specified in the first cell was not present or is " +
        "null. Please use and instance-object or an array of instances-objects as a fact value.";

    private readonly COL_HEADER = "Action/Condition column headers can only be \"Condition\" " +
        "or \"Action\".";

    private readonly COL_HEADER_ARGMT = "All conditions must be specified before all actions";

    private readonly OP_BLANK = "Operation cannot be blank";

    private readonly OP_FORMAT = "The operation must began with the Fact's attribute, contain " +
        "one operator, and end with \"$param\". Operation:";

    private readonly ATTR_UNDEF = "Attribute does not exist on the fact for operation:";

    private readonly MUST_END_WITH_PARAM = "Condition operation must end with \"$param\". " +
        "Operation:";

    private readonly PARAM_COUNT = "The number of params for an action operation must match the " +
        "number of argument for the method:";

    private readonly ASSIGN_PARAM_COUNT = "An assignment action operation can only contain " +
        "one argument. Assignment:";

    private readonly RULE_NAME_EMPTY = "The rule name (first cell for a rule row for a decision " +
        "table) cannot be empty.";

    private readonly NOT_AN_OP = "The following operator is not a comparison operator:";

    private readonly INVALID_VAL = "The value provided in the table was not a null, boolean, " +
        "number, string, or import. Cell value or values:";

    private readonly id: string;


    constructor(id: number) {
        this.id = "Error on DecisionTable " + id + ": ";
    }

    get startCell(): string {
        return this.id + this.START_CELL;
    }

    get factFalsey(): string {
        return this.id + this.FACT_FALSEY;
    }

    get colHeader(): string {
        return this.id + this.COL_HEADER;
    }

    get colHeaderArgmt(): string {
        return this.id + this.COL_HEADER_ARGMT;
    }

    get opBlank(): string {
        return this.id + this.OP_BLANK;
    }

    get opFormat(): string {
        return this.id + this.OP_FORMAT;
    }

    get attrUndef(): string {
        return this.id + this.ATTR_UNDEF;
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

    get notAnOp(): string {
        return this.id + this.NOT_AN_OP;
    }

    get invalidVal(): string {
        return this.id + this.INVALID_VAL;
    }
}

export default TableErrs;
