const AIGenerator = require("./AIGenerator");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

const CodeGeneratorCore = require("../CodeGeneratorCore")

class ModelExplainGenerator extends AIGenerator{

    constructor(client){
        super(client);

        this.codeGenerator = new CodeGeneratorCore()
    }
    
    createPrompt(){
        let me = this;
        
        let codeGenElements = this.codeGenerator.convertModelForCodeGen(this.client.input.model)
        let boundedContext = codeGenElements.modelForElements.BoundedContext.find(element => element.name === me.client.input.bcName)

        var cache = []
        const includingKeys = ["", "events", "aggregateRoot", "aggregates", "policies", "commands", "actors", "fieldDescriptors", "name", "type", "displayName"]
        let bcInJSON = JSON.stringify(boundedContext,
             (key, value) => {
              if (isNaN(key) && !includingKeys.includes(key)) return;

              if (typeof value === 'object' && value !== null) {
                // Duplicate reference found, discard key
                if (cache.includes(value)) return;
            
                // Store value in our collection
                cache.push(value);
              }
              return value;
            })

        return `we have a bounded context definition that is defined in DDD concept. please explain detail of this boundedContext definition:
        ${bcInJSON}
        `
    }


}


module.exports = ModelExplainGenerator;