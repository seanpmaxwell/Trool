# Trool - a Rule Engine for NodeJS/TypeScript
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
can update a fact (the guide contains all the details for setting up a decision-table).

- You must follow the format closely for setting up a decision-table. Trool may spit out errors if
you do not set things up correctly. 

- Export your spreadsheet as a CSV file.

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
public async calcTotalPrice(): Promise<string> {
    
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


<br>

## Guide
// mention that strict format is enforced readability purposes.
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
