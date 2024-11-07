# TROOL - a spreadsheet rule engine for TypeScript
<h3>Get rules out of the code so non-engineers can make updates over time!</h3>
<br>


## Features
- Manage rules in a business spreadsheet format.
- Heavily inspired by Java's KnowledgeBase Library.
- Allows use of `Import` objects so values can be reused. These can be passed dynamically through
the code or hardcoded in the spreadsheet.
- TypeScript First!


## Requirements
- The spreadsheet must be exported as a _.csv_ before usage. 
- Works client-side or server side but if you want to uses file-paths for the csv you must use it server side.


## Screenshot
<img alt='fullOverview' src='https://github.com/seanpmaxwell/trool/raw/master/images/fullOverview.png' border='0'>


## Quick Start
- install `$ npm install --save trool`

- Open Excel, LibreOffice Calc, or some other spreadsheet tool of your choice.

- A **Fact** is an object or array of objects, which you want to update based on conditions that may change over time. Create at least one decision-table on the spreadsheet so you can update a fact.

- You must follow the format closely for setting up a decision-table. Trool may throw errors if you do not set things up correctly. The guide contains all the details for setting up a decision-table. You can look at the screen-shot above if you want a quick glimpse of what decision-tables look like. 

- Export your spreadsheet as a CSV file. The rules for formatting the csv are the same as they are for the `csvtojson` library. That's what Trool uses internally to convert the csv to a JSON object.

- To use Trool you must create a new instance of the class (`new Trool()`) and then intialize it by calling `.initialize(csv is a string or filePath)`. The csv can be the path to a CSV file, or you can pass in a string formatted as a csv and pass `true` as the second param. `initialize()` is asynchronous so make sure to use `async/await` with it. Now you can call `applyRules()` and pass in the facts-holder which returns the updated facts.

- The constructor has an additional optional param `showLogs` to turn logging on or off.

- The facts and the imports must be wrapped in holder objects, with the key being the name of the fact/import to use in the spreadsheet and the value being the actual fact or import. The `imports` param is optional because you may only want to use the ones specified in the spreadsheet or have no need for any. 

```typescript
import Trool from 'trool';
import logger from 'jet-logger';

const csvFilePath = 'some-file-path';

const factsHolder = {
    Visitors: [visitor1, visitor2],
    Tickets: ticket1,
};

const importsHolder = { 
    VisitorTypes: {
        ADULT: 'Adult',
        CHILD: 'Child',
    },
};

(async () => {
    try {
        const trool = new Trool();
        await trool.initialize(csvFilePath or "...csv string...");
        const updatedFacts = trool.applyRules(factsHolder, importsHolder);
        totalPrice = addUpEachTicketPrice(updatedFacts);
    } catch (err) {
        logger.error(err.message);
    }
})();
```

- The `updatedFacts` variable in the previous snippet will contain all the objects in the same order as the `factsHolder` that was passed in.
<br>


## Guide

> **Important!** When you setup your decision-tables and imports there are some rules to follow in order for your tables/imports to be properly loaded into memory. Strict formatting is enforced for readability purposes.

**Decision-Tables:**

- All decision-tables must start with a cell containing the text `Table: "Fact Name"`. A table without a fact name will throw an error. If you create two tables that have the same fact-name, the second table will overwrite all the changes from the first.

- A table will end when it reaches an empty row, the end of the file, or the start of a new table or import. For readability, you should terminate all tables with an empty row.

- The first 2 rows on a decision-table are for specifying the conditions and the actions. If all conditions are true, then the actions will execute. After the start cell (the cell with `Table: "Fact Name"`) you must specify at least 1 condition and 1 action.

- Specifying Condition and Action columns must be done by putting `'Condition'` or `'Action'`, at the top of each column. These are case sensitive so make sure to capitalize the values. All conditions must come before all actions and you cannot have anything other than `'Condition'` or `'Action'` at the top of your table columns. 

- The condition must be a statement which evaluates to `true` or `false`. There are two ways to declare a condition:
    - You can use a comparator which must be an existing JavaScript comparator such as `==` or `<=`. The left side of the statement must be a method or property on the fact's object and the right side must be `$param`. The values in the rows below will replace `$param`.
    - You can use a use a fact function which must use the format: `functionName($param)`

- Actions are methods on a fact which will execute if all the conditions evaluate to true. Unlike conditions, you can have multiple params passed in. The action must be a method or property on the fact or else Trool will throw an error. The number of params in the action columns' cells below must match the number of `$param` strings or else Trool will throw an error. 

- All rows on a decision-table, except for the first 2, are referred to as _rules_. A rule works by evaluating a list of conditions against cell values which, if they all evaluate to true, will execute the specified actions. A rule must start with a rule name and can be anything but cannot be blank.

- For each cell on the rule, if it is a condition column, the cell value will replace the `$param` value and evaluate the cell as `true` or `false`. An empty cell will automatically be evaluated as `true`. If any cell evaluates to `false`, that rule will fail and the decision-table will go on the next rule.

- While on a rule's action column, each param specified must be separated by a comma. If no params are specified (the cell is blank), the rule will skip that action column. 

- Whew that was a lot! Now that we've gone over the rules for creating tables, let's look at an example in detail. In the following snippet, we see an example on a decision-table and the fact `Tickets`.

<img alt='sampleTable' src='https://github.com/seanpmaxwell/trool/raw/master/images/sampleTable.png' border='0'>

- To update this fact you needs to make sure the `Tickets` property exists on the facts-holder when it gets passed to `applyRules()`. If `Tickets` is an array, the decision-table will get applied to each `Ticket` object in the array. 

- The table has one condition and one action. There's also 2 rules: `Set Price - Regular` and `Set Price - Season`. Look at the operations for the condition and action. On the left side of each operation we can see the properties `option` and `price`. This means that each Ticket object passed in must have the `option` and `price` properties or else an error will be thrown.

- The first rule `Set Price - Regular` will take the value for `option` and check and see if its value
is equal to the string `"Regular"`. If so, it will apply the action column to the fact. The property `price` will be set to the value `70`. The exact same sequence of events will take place for the next rule `Set Price - Season`. In other words, if the Ticket option is `"Season"`, the price will be `600`, if the option is`"Regular"`, the price will be `70`.

- And that's how Trool works! If you need to change the price for a Regular or Seasonal ticket over time without bugging your engineers, just have someone else make updates to the spreadsheet :)
<br>


**Imports:**

- For large complicated spreadsheets you might want to reuse certain values. Suppose for Visitors who might be buying these tickets the maximum age for a child is `18`. One might need to reuse this value for multiple rules/tables and if it's updated in one place, it needs to be updated everywhere. For example, the maximum age for a child might change from `18` to `15` or something like that. This is where imports come in handy. An import basically sets up a simple JSON object that you can access in your tables. Imports can be created in the spreadsheet or passed through `applyRules()`. 

- Trool iterates the entire spreadsheet and first looks for all the imports, then it goes back through and initializes all the decision-tables. So the ordering of your tables/imports does not matter. For cleanliness I recommend keeping them separated.

- All imports must begin with the cell `Import: "Import Name"`. If you pass an import in the imports holder (via `applyRules()`) that has a key matching an import name in the spreadsheet, you will get the warning: `!!WARNING!! The spreadsheet is using an import name already passed via the imports object. The spreadsheet will overwrite the import: "Import Name"`.

- The quick-start had an example of passing imports through `applyRules()`. Let's look at an example of an import hardcoded in the spreadsheet.<br/>
<img alt='importExample' src='https://github.com/seanpmaxwell/trool/raw/master/images/importExample.png' border='0'>

- With this import, each table will have access to an object named `TicketTypes` and all of its properties. If you were to place `TicketTypes.SEASON` in a cell for the operation `option == $param`, the Ticket object property `option` will be set to `"SEASON"` as the value.

- When using imports through `applyRules()`, you don't have to necessarily use an object as a property and could have it as a primitive. VisitorTypes itself could be a string or number. I don't recommend using imports this way though; it could be confusing in a collaborative environment.

- One more thing, you cannot use nested properties on imports: i.e. `Import.key.key` This is intentional, it would lead to a very message spreadsheet. 
<br>


**Special Notes:**

- In Trool spreadsheets, `==` under the hood is actually using `===`. 

- The values you can pass through cells are `string`, `number`, `boolean`, and `null`. Don't use objects or `undefined`. Via imports, you could actually use an object as a `$param` value, but don't do it. This could be confusing for non-engineers. Stick with primitives.

- Property name rules are the same as for JavaScript keys. That means alphanumeric, underscores, and dashes. Anything other than characters will throw an error.
