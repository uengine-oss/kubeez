const JsonAIGenerator = require("./JsonAIGenerator");

class AggregateMemberGenerator extends JsonAIGenerator{

    constructor(client){
        super(client); 
        
        this.aggregateRoot = client.input.aggregateRoot;
        this.instruction = client.input.instruction;
    }
    // to have multiple order items and order states
    createPrompt(){
        let prompt = 
`
In ddd, we have following aggregate root class:

class ${this.aggregateRoot.name}{
  ${this.aggregateRoot.fieldDescriptors}
}

Can you append more value objects and enumerations to this aggregate root:
${this.instruction}

in this json format:

{
    classes: [
    {
       name: "Class Name",
       displayName: "Display Name", // Readable property name
       classType: "Entity" | "Value Object" | "Enumeration",  //must be in these three types.
       isAggregateRoot: true || false,
        "properties": [
            {
                "name": "propertyName", // Property Name must be Camel-Case
                "type": "PropertyType", // Property Type is must be in java class name. i.e. Integer, String, Boolean, Float, Double, Long, Date. Reduce the package 'java.lang.' if the class is primitive type,
                "isKey": true || false,
                "displayName": "Display Name", // Readable property name
                "uiStyle":{
                    "inputUI": "RADIO-BOX" || "SELECT" || "TEXT" || "CALENDAR" || "GUAGE", // proper user interface type for input this property value
                    "viewUI" : "TEXT" || "...", //proper user interface for viewing this property value    
                }
                "enumerationValues" : ["value1", "value2"] // if the class is an Enumeration type
            }
        ]
    }],
    relations: [{
        sourceEntity: "Source Class Name",
        targetEntity: "Target Class Name",
        multiplicity: "OneToOne" | "OneToMany" | "ManyToOne",
        type: "Association" | "Composition" | "Generalization" //must be in these three types
    }]
}

please don't forget creating relations between all the generated classes.
`
        return prompt
    }

    createModel(text) {
        try {
            const modelData = super.createModel(text)
            
            const modelValue = {
                elements: [],
                relations: []
            }
    
            function uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
    
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
    
            if(modelData['classes'] && modelData['classes'].length > 0) {
                modelData['classes'].forEach((entity, idx) => {
                    let element = null
                    let eleCnt = 0

                    if(entity.isAggregateRoot){
                        element = {
                            _type: "org.uengine.uml.model.Class",
                            elementView: {
                                _type: "org.uengine.uml.model.Class",
                                id: uuid(),
                                style: "{}",
                                fieldH: 50,
                                height: 100,
                                methodH: 30,
                                subEdgeH: 70,
                                titleH: 30,
                                width: 200,
                                x: 180 + eleCnt * 200, 
                                y: 300
                            },
                            fieldDescriptors: [],
                            isAbstract: false,
                            isAggregateRoot: false,
                            isInterface: false,
                            isVO: true,
                            name: entity.name,
                            nameCamelCase: entity.name,
                            namePascalCase: entity.name,
                            namePlural: entity.name,
                            operations: [],
                            parentOperations: [],
                            relationType: null,
                            relations: [],
                            selected: false
                        }
    
                    } else if(entity.isAggregateRoot === false){
                        if (entity.classType == "Enumeration") {
                            element = {
                                _type: "org.uengine.uml.model.enum",
                                elementView: {
                                    _type: "org.uengine.uml.model.enum",
                                    id: uuid(),
                                    style: "{}",
                                    height: 100,
                                    subEdgeH: 50,
                                    titleH: 50,
                                    width: 200,
                                    x: 180 + eleCnt * 200, 
                                    y: 300
                                },
                                isAbstract: false,
                                isAggregateRoot: false,
                                isInterface: false,
                                isVO: false,
                                name: entity.name,
                                nameCamelCase: entity.name,
                                namePascalCase: entity.name,
                                namePlural: entity.name,
                                items: [],
                                relationType: null,
                                relations: [],
                                selected: false
                            }
                        } else {
                            element = {
                                _type: "org.uengine.uml.model.vo.Class",
                                elementView: {
                                    _type: "org.uengine.uml.model.vo.Class",
                                    id: uuid(),
                                    style: "{}",
                                    fieldH: 50,
                                    height: 100,
                                    methodH: 30,
                                    subEdgeH: 70,
                                    titleH: 30,
                                    width: 200,
                                    x: 180 + eleCnt * 200, 
                                    y: 300
                                },
                                fieldDescriptors: [],
                                isAbstract: false,
                                isAggregateRoot: false,
                                isInterface: false,
                                isVO: true,
                                name: entity.name,
                                nameCamelCase: entity.name,
                                namePascalCase: entity.name,
                                namePlural: entity.name,
                                operations: [],
                                parentOperations: [],
                                relationType: null,
                                relations: [],
                                selected: false
                            }
                        }
                    }

                    if(entity.properties){
                        entity.properties.forEach((property) => {
                            if (element._type.endsWith("enum") && element.hasOwnProperty("items")) {
                                if (property.enumerationValues && 
                                        property.enumerationValues.length > 1
                                ) {
                                    property.enumerationValues.forEach((val) => {
                                        element.items.push({
                                            "value": val
                                        })
                                    })
                                }
                            }
                            if(element.fieldDescriptors){
                                var attr = {
                                    displayName: property.displayName ? property.displayName : null,
                                    className: property.type ? property.type : null,
                                    isKey: property.isKey ? property.isKey : false,
                                    isList: false,
                                    isLob: false,
                                    isName: false,
                                    isVO: false,
                                    name: property.name ? property.name : false,
                                    nameCamelCase: property.name ? property.name : false,
                                    namePascalCase: property.name ? property.name : false,
                                    _type: "org.uengine.model.FieldDescriptor"
                                }
                                element.fieldDescriptors.push(attr)
                            }
                        })
                    }

                    if (entity.enumerationValues && entity.enumerationValues.length > 0) {
                        entity.enumerationValues.forEach((val) => {
                            element.items.push({
                                "value": val
                            })
                        })
                    }
                    if(element){
                        modelValue.elements.push(element)
                        eleCnt++;
                    }
                })
            }
    
    
            if(modelData['relations']) {
                modelValue.relations = modelData['relations']
            }
    
            return modelValue

        } catch (error) {
            console.log(error)
        }
    }


}


module.exports = AggregateMemberGenerator;