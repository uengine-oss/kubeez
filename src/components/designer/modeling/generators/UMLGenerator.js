import AIGenerator from "./AIGenerator";
let partialParse = require('partial-json-parser');


export default class UMLGenerator extends AIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `Please create an uml model in json for ${this.client.input.title} \nThe format must be as follows:\n
        {
            "classes": [
                {
                    "name": "Class Name",
                    "properties": [
                        {
                            "name": "Property Name",
                            "type": "Property Type" // Property Type is must be in full java class name. i.e. Integer, String, Boolean, Float, Double, Long, Date,
                            "isKey": true or false
                        }
                    ]
                }
            ]
             ,
            "relations": [
                {
                    "type": "Generalization" | "Aggregation" | "Composition",
                    "from": "Source Class Name",
                    "to": "Target Class Name",
                    "name": "Relation Name"
                }
            ]
        
        }\n
        `
    }

    createModel(text){
        console.log(text);
        let model = partialParse(text);

        return model;

    }


}