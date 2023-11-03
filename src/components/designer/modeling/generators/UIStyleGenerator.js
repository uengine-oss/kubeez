const AIGenerator = require("./AIGenerator");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

const CodeGeneratorCore = require("../CodeGeneratorCore")

class UIStyleGenerator extends AIGenerator{

    constructor(client){
        super(client);

        this.codeGenerator = new CodeGeneratorCore()

        this.originalLanguage = this.preferredLanguage;
        this.preferredLanguage = "English";

    }
    
    createPrompt(){
        let me = this;
        
        let codeGenElements = this.codeGenerator.convertModelForCodeGen(this.client.input.model)
        let aggregate = codeGenElements.modelForElements.Aggregate.find(element => element.name === me.client.input.aggregateName)

        var cache = []
        const includingKeys = ["", "events", "aggregateRoot", "aggregates", "policies", "commands", "fieldDescriptors", "name", "type", "displayName"]
        let jsonModel = JSON.stringify(aggregate,
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

        return `we have following event storming model that is defined in DDD concept. 
        ${jsonModel}

        please generate UI style hint for creating some User Interfaces in this json format:

        "aggregates": [ 
            {
                "name": "AggregateName",  // Aggregate Name must be Pascal-Case
                "${this.originalLanguage.toLowerCase()}Name: "Aggregate Name in ${this.originalLanguage}", 
                "${this.originalLanguage.toLowerCase()}Description: "Description about the aggregate in ${this.originalLanguage}", 
                "uiStyle":{
                    "layout": "CARD" | "GRID"  | "LIST-ITEM",
                    "nameProperty": "property name for representing the object",
                    "imageUrlProperty":"property name for representing image url if exists",
                    "icon": "material design icon font name for representing this aggregate data",
                    "isRepresentingUser": true | false
                },
                "properties": [
                    {
                        "name": "propertyName", // Property Name must be Camel-Case
                        "${this.originalLanguage.toLowerCase()}Name: "Property Name in ${this.originalLanguage.toLowerCase()}", 
                        "type": "PropertyType", // Property Type can be known java class or the Value object classes listed here: must be one of Address, Portrait, Rating, Money, Email. use simple name reduce the package name if java class name.
                        "isKey": true or false,
                        "uiStyle":{
                            "inputUI": "TEXT" | "SELECT" | "TEXTAREA" // proper user interface type for input this property value
                        }
                        "options" : ["value1", "value2"] // optional. if there are selectable options for this value.
                    }
                ],
                "commands": [
                    {
                        "name": "Command Name",
                        "${this.originalLanguage.toLowerCase()}Name: "Name in ${this.originalLanguage.toLowerCase()}", 
                        "properties": [
                            {
                                "name": "Property Name",
                                "type": "Property Type"
                            }
                        ],
                        "api_verb": "POST" | "DELETE" | "PUT",
                        "api_uri": "uri",
                        "isCreation": true | false, //true if this command creates new instance of the aggregate
                        "actor": "Actor Name",
                        "outputEvents": ["Event Name"],
                        "uiStyle":{
                            "icon": "material design icon font name for representing this command"
                        }

                    }
                ],
                
                "events": [
                    {
                        "name": "Event Name", // PascalCase
                        "properties": [
                            {
                                "name": "Property Name", // Camel Case
                                "type": "Property Type" //  Java Class Name Type
                            }
                        ]
                    }
                ]
            }
        ]
        `
    }


}


module.exports = UIStyleGenerator;