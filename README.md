# Trool - a rule engine for NodeJS/TypeScript
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
- Facts and imports from code must be JavaScript instance-objects.


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
        Ticket: new Ticket()
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
##### Important! When you setup your decision-tables and imports there are some rules to follow the in order for your tables/imports to be properly loaded into memory. Strict formatting is enforced for readability purposes.

**Tables:**

- All tables must start with a cell containing the text `Table: "factName"`. A table without a fact name
or with a fact name that does not exist on the facts container object, will throw an error.

- A table will end when it reaches an empty row, the end of a the file, or the start of a new table
or import. For readability, you should terminate all tables with an empty row.

- The first 2 rows on a decision-table are for specifying the conditions and the actions. If all conditions
are true, then the actions will execute. After the start cell (the cell with `Table: "factName"`) you
must specify at least 1 condition and 1 action.

- Specifying Condition and Action columns must be done by putting `'Condition'` or `'Action'`, at the 
top of each column. These are case sensitive so make sure to capitalize the values. All conditions
must come before all actions and you cannot have anything other than `'Condition'` or `'Action'` at
the top of your table columns. 

- The condition must be a statement which evaluates to `true` or `false`. The left side of the statement 
must be a method or getter on the fact's instance-object and the right side must be `$param`. The operator 
must be an existing JavaScript comparator such as `==` or `<=`. The values in the rows below will replace 
`$param`.

For example, suppose I want to get the age of a visitor for an app which calculates ticket prices. I
would need to create a TypeScript getter (`get age(): number {}`) or a method like `getAge() {}` to 
fetch the visitors age and compare it to the parameter value.<br>

- Actions are methods on a fact which will execute if all the conditions evaluate to true. Unlike conditions,
you can have multiple params passed in. The action must be a method or a TypeScript setter function on
the fact or else Trool with throw an error. The number or params in the passed through the cells below
must match the number or `$param` strings or else Trool will throw an error. 

- All remaining rows on a decision-table are referred to as rules. A rule works by evaluating a list of 
conditions which, if they all evaluate to true, will execute the specified actions. A rule must
start with a rule name and can be anything but cannot be blank.<br>

- For each cell on the rule, if it is a condition column, the cell value will replace the `$param` value
and evaluate the cell as true or false. An empty cell will automatically be evaluated as true. If
any cell evaluates to false, that rule will fail and the decision-table will go on the next rule. If

// show screenshot here of the Tickets table and explain the different parts. 


**Imports:**<br>
// 
// mention values provided must be null, boolean, number, string, or be a property on an import
// mention that if a spreadsheet import and code import have the same name. The spreadsheet will override
the code import

// mention that it's not a good practice to set strings in directly to the spreadsheet and should
// use a constants class. This prevents Product Owners from inputing bad values into the spreadsheet.
// a fact must have a getter and a setter to be modified
// mention that double periods don't work like obj.key.key on single ones
// Tell users to only use letters and numbers when setting up imports

// Object passed for fact "fact name" does not have the attribute or method "attribute or method" name
// iterate through each cell in Rule row, check the value in that cell using the condition at that index. 
// Set value at that cell to true and false. Break if hits false
// empty cell will just be set to true
// dont execute Action where blank

// 600 lines of code
