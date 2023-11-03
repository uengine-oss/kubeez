const ESGenerator = require("./ESGenerator");
//const JsonAIGenerator = require("./JsonAIGenerator");
let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class BigPictureESGenerator extends ESGenerator{

    constructor(client){
        super(client);
    }
    
    createModel(text){
        var me = this
        let modelValue
        try {
            modelValue = partialParse(text);

            
            var bcCnt = 0
            var heightVal = 0
            // var elements = {}
            me.lastBCView = null
            me.resetUUID();
    
            if(modelValue["boundedContext"]){
                Object.keys(modelValue["boundedContext"]).forEach(function (key, bcIdx){

                    if(modelValue["boundedContext"][key]["aggregates"]){
                        modelValue["boundedContext"][key]["aggregates"].forEach(function (agg, aggIdx){
                            if(agg["events"]){
                                agg["events"].forEach(function (ele, idx){
                                    let elementUuid = 'event-' + ele.name
                                
                                    me.modelElements[elementUuid] = {
                                    
                                        alertURL: "/static/image/symbol/alert-icon.png",
                                        author: me.userUid,
                                    
                                        checkAlert: true,
                                        description: null,
                                        elementView: {
                                            angle: 0,
                                            height: 115,
                                            id: elementUuid,
                                            style: "{}",
                                            width: 100,
                                            x: 150 + idx * 150, 
                                            y: 200, 
                                            _type: "org.uengine.modeling.model.Event"
                                        },
                                        fieldDescriptors: [],
                                        hexagonalView: {
                                            height: 0,
                                            id: elementUuid,
                                            style: "{}",
                                            width: 0,
                                            x: 0,
                                            y: 0,
                                            _type: "org.uengine.modeling.model.EventHexagonal"
                                        },
                                        name: ele.name,
                                        displayName: ele[me.originalLanguage + "Name"],
                                        nameCamelCase: changeCase.camelCase(ele.name),
                                        namePascalCase: changeCase.pascalCase(ele.name),
                                        namePlural: "",
                                        relationCommandInfo: [],
                                        relationPolicyInfo: [],
                                        rotateStatus: false,
                                        selected: false,
                                        trigger: "@PostPersist",
                                        _type: "org.uengine.modeling.model.Event"
                                    }
                                
                                    if(ele.properties && ele.properties.length > 0){
                                        ele.properties.forEach(function (property){
                                            var field = {
                                                className: property.type,
                                                isCopy: false,
                                                isKey: idx == 0 ? true:false,
                                                name: property.name,
                                                nameCamelCase: changeCase.camelCase(property.name),
                                                namePascalCase: changeCase.pascalCase(property.name),
                                                _type: "org.uengine.model.FieldDescriptor"
                                            }
                                            if(me.modelElements[elementUuid]){
                                                me.modelElements[elementUuid].fieldDescriptors.push(field)
                                            }
                                        })
                                    }
                                })
                            }

                        })
                    }
                })

                var obj = {
                    projectName: modelValue["serviceName"],
                    elements: me.modelElements,
                    relations: {},
                    uiStyle: me.client.input.uiStyle
                }
    
                return obj;
            } 
        } catch(e){
            console.log(e)
            var obj = {
                projectName: modelValue ? modelValue["serviceName"] : "untitled",
                elements: me.modelElements ? me.modelElements : {},
                relations: {},
                uiStyle: me.client.input.uiStyle
            }

            return obj;
        }
    }


}


module.exports = BigPictureESGenerator;