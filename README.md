# TROOL - a spreadsheet rule engine for NodeJS/TypeScript
<h3>Get your rules out of your code so non-engineers can make updates over time!</h3>
<br>


## Features
- Manage rules in a business spreadsheet format
- Heavily inspired by Java's KnowledgeBase Library
- Allows use of `Import` objects so values can be reused. These can be passed dynamically through
the code or hardcoded in the spreadsheet.
- GitHub Repo contains fully-functional sample project so you can start practicing right away.
- Fully type-safe :)


## Requirements
- Spreadsheet must be exported as a .csv before usage. 
- Can be used directly with NodeJS/JavaScript but documentation is in TypeScript.


## Screenshot
<img alt='fullOverview' src='https://github.com/seanpmaxwell/trool/raw/master/fullOverview.png' border='0'>


## Quick Start
- install `$ npm install --save trool`

- Open Excel, LibreOffice Calc, or some other spreadsheet tool of your choice.

- A **Fact** is an instance-object or array of instance-objects, which you want to update based on
conditions which may change over time. Create at least one decision-table on the spreadsheet so you
can update a fact.

- You must follow the format closely for setting up a decision-table. Trool may spit out errors if
you do not set things up correctly. The guide contains all the details for setting up a decision-table.
You can look at the screenshot above if you want a quick glimpse on what decision-tables look like. 

- Export your spreadsheet as a CSV file. The rules for formatting the csv are the same as they are
for the `csvtojson` library. That's what trool using internally to convert the csv to a json object.

- Create a new NodeJS program (preferably with TypeScript) and import the `trool` library at the top.
Instantiate a new `trool` object and pass `true` to the constructor if you want to show logs while
the library updates your facts.

```typescript
import Trool from 'trool';

class PriceCalculator {

    private trool: Trool;

    constructor() {
        this.trool = new Trool(true);
    }
```

- The trool library only provides 1 public method `applyRules(...)` which returns a promise containing
the updated facts. So create an `async/await` method to fire off `applyRules()` and wrap it in a try/catch
block.

- `applyRules(...)` will take in the path to the csv file, the facts to be updated, and the imports.

- The facts and the imports must be wrapped in holder objects, with the key being the name of the 
fact/import to use in the spreadsheet, and the value being the actual fact or import. The `imports`
param is optional because maybe there are no imports or you only want to use ones specified in the
spreadsheet. 

```typescript
public async calcTotalPrice(): Promise<void> {
    
    const facts = {
        Visitors: [new Visitor(), new Visitor()],
        Tickets: new Ticket()
    }

    const imports = { 
        VisitorTypes: {
            ADULT: 'Adult',
            CHILD: 'Child'
        }
    };

    try {
        const csvFilePath = path.join(__dirname, 'Name_of_Spreadsheet.csv');
        const updatedFacts = await this.trool.applyRules(csvFilePath, facts, imports);

    } catch (err) {
        console.log(err.message);
    }
}
```

- The updatedFacts variable in the previous snippet will contain all the same key/value pairs and
arrays in the same order as the facts object that was passed in.

<br>


## Guide
**Important! When you setup your decision-tables and imports there are some rules to follow the in order 
for your tables/imports to be properly loaded into memory. Strict formatting is enforced for readability purposes**.

**Decision Tables:**

- All decision-tables must start with a cell containing the text `Table: "Fact Name"`. A table without a fact name
or with a fact name that does not exist on the facts container object, will throw an error. If you create
2 tables that have the same fact-name, the second table will overwrite all the changes from the first.

- A table will end when it reaches an empty row, the end of a the file, or the start of a new table
or import. For readability, you should terminate all tables with an empty row.

- The first 2 rows on a decision-table are for specifying the conditions and the actions. If all conditions
are true, then the actions will execute. After the start cell (the cell with `Table: "Fact Name"`) you
must specify at least 1 condition and 1 action.

- Specifying Condition and Action columns must be done by putting `'Condition'` or `'Action'`, at the 
top of each column. These are case sensitive so make sure to capitalize the values. All conditions
must come before all actions and you cannot have anything other than `'Condition'` or `'Action'` at
the top of your table columns. 

- The condition must be a statement which evaluates to `true` or `false`. The left side of the statement 
must be a method or getter on the fact's instance-object and the right side must be `$param`. The operator 
must be an existing JavaScript comparator such as `==` or `<=`. The values in the rows below will replace 
`$param`. For example, suppose I want to get the age of a visitor for an app which calculates ticket prices. I
would need to create a TypeScript getter (`get age(): number {}`) or a method like `getAge() {}` to 
fetch the visitor's age and compare it to the parameter value.<br>

- Actions are methods on a fact which will execute if all the conditions evaluate to true. Unlike conditions,
you can have multiple params passed in. The action must be a method or a TypeScript setter function on
the fact or else Trool with throw an error. The number or params in the passed through the cells below
must match the number or `$param` strings or else Trool will throw an error. 

- All remaining rows on a decision-table are referred to as rules. A rule works by evaluating a list of 
conditions against cell values which, if they all evaluate to true, will execute the specified actions. 
A rule must start with a rule name and can be anything but cannot be blank.

- For each cell on the rule, if it is a condition column, the cell value will replace the `$param` value
and evaluate the cell as true or false. An empty cell will automatically be evaluated as true. If
any cell evaluates to false, that rule will fail and the decision-table will go on the next rule.

- While on a rule's action column, each param specified must be separated by a comma. If no params
are specified (the cell is blank), the rule will skip that action column. 

- Whew that was a lot! Now that we've gone over the rules for creating tables, let's look at an
example in detail. In the following snippet, we see an example on a decision-table and the fact `Tickets`.

<img alt='sampleTable' src='https://github.com/seanpmaxwell/trool/raw/master/sampleTable.png' border='0'>

- To update this fact you needs to make sure the `Tickets` property exists on the facts-holder when it
gets passed to `applyRules()`. If `Tickets` is an array, the decision-table will get applied to each
Ticket instance in the array. 

- The table has one condition and one action. There's also 2 rules: `Set Price - Regular` and `Set Price - Season` 
respectively. Look on row 30 at the operations for the condition and action. On the left side of each operation 
we can see the properties `option` and `price`. This means that each Ticket instance object passed in must have 
getters for the `option` and `price` properties or else an error will get thrown. If you're not using TypeScript
you'll have to look up how TypeScript implements getters and setters under the hood. 

- The first rule `Set Price - Regular` will take the value for `option` and check and see if it's value
is equal to the string `"Regular"`. If so, it will apply the action column to the fact. The setter for
`price` will be called and the value `70` will be passed in. The exact same sequence of events will take
place for the next rule `Set Price - Season`. In other words. if the Ticket option is `"Season"`, the price
will be `600`, if the option is `"Regular"`, the price will be `70`.

- And that's how Trool works! If you need to change the price for a Regular or Seasonal ticket
over time without bugging your engineers, just have the product-owners (or whoever) make updates to the
spreadsheet :)
<br>


**Imports:**

- For large complicated spreadsheets you might want to reuse certain values. Suppose for Visitors who
might be buying these tickets the maximum age for a child is `18`. One might need to reuse this value
for multiple rules/tables and if it's updated in once place, it needs to be updated everywhere. For 
example, the maximum age for a child might change from `18` to `15` or something like that. This is where
imports come in handy. An import basically sets up a simple JSON object that you can access in your tables.
Imports can be created in the spreadsheet or passed in through `applyRules()`. 

- Trool iterates the entire spreadsheet first look for all the imports, then it goes back through
and initializes all the decision-tables. So the ordering of your tables/imports does not really matter.
For cleanliness I recommend keeping them separated. 

- All imports must begin with the cell `Import: "Import Name"`. If you pass an import in the imports holder 
(via `applyRules()`) that has a key matching an import name in the spreadsheet, you will get the warning:
`!!WARNING!! The spreadsheet is using an import name already passed via the imports object. The spreadsheet 
will overwrite the import: "Import Name"`.

- The quick-start had an example of passing imports through `applyRules()`. Let's look at an example of
an import hardcoded in the spreadsheet.
<img alt='importExample' src='https://github.com/seanpmaxwell/trool/raw/master/importExample.png' border='0'>

- With this import, each table will have access to a object named `VisitorTypes` an all of its properties.
If you were to place `VisitorTypes.ADULT` in a cell for the operation `visitorType = $param` for example, 
the Visitor object would call the `visitorType` setter and pass `"Adult"` as the value.

- When using imports through `applyRules()`, you don't have to necessary use an object as a property
and could have it as a primitive. VisitorTypes itself for example could be a string or number. I don't
recommend using imports this way though. It could be confusing in a collaborative environment.

- One more thing, you cannot use nested properties on imports: i.e. `Import.key.key`. This is intentional,
it would lead to a very message spreadsheet. 
<br>


**Special Notes:**

- In Trool spreadsheets `==` under the hood is actually `===`. 

- The values you can pass through cells are strings, numbers, true, false, and null. Don't use objects
or undefined. Via imports, you could actually use an object as a `$param` value, but don't do it. This
could be confusing for non-engineers. Stick with primitives. Create extra getters and setters when dealing
with multiple values. 

- Import property names are the same as rules for JavaScript keys. That means alphanumeric, underscores,
and dashes. Anything other characters will throw an error.
