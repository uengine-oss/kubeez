const JsonAIGenerator = require("./JsonAIGenerator");
const CodeGeneratorCore = require("../CodeGeneratorCore");
let changeCase = require('change-case');

class ReadModelGenerator extends JsonAIGenerator{

    constructor(client){
        super(client); 
        
        this.codeGenerator = new CodeGeneratorCore({});
        this.originalModel = {}
        this.events
    }
    

    createPrompt(){
      var me = this

      let codeGenElements = me.codeGenerator.convertModelForCodeGen(me.client.input.model)
      me.events = codeGenElements.modelForElements.Event

      var cache = []
      const includingKeys = ["", "name", "type", "displayName", "fieldDescriptors", "className"]
      // let eventInJson = JSON.stringify(events,
      //      (key, value) => {
      //       if (isNaN(key) && !includingKeys.includes(key)) return;

      //       if (typeof value === 'object' && value !== null && key != "className") {
      //         // Duplicate reference found, discard key
      //         if (cache.includes(value)) return;
          
      //         // Store value in our collection
      //         cache.push(value);
      //       }
      //       return value;
      //     })

      // eventInJson = JSON.parse(eventInJson)

      var domainEvents = ""
      me.events.forEach(function (event, eventIndex){
        domainEvents += event.name + "("
        event.fieldDescriptors.forEach(function(field, fieldIndex){
          if (isNaN(field.name)) {
            domainEvents += field.className+ " " + field.name;
            if (fieldIndex < event.fieldDescriptors.length - 1) { // 마지막 요소가 아닌 경우에만 ", "을 추가
              domainEvents += ", ";
            }
          }
        })
        domainEvents += ")\n\n"
      })

      return `Please create a Read Model in json for following domain events: 
        
        Let's say there are domain events:

        ${domainEvents}

        I want to create a CQRS ReadModel that collects the data status of order and the product id. Can you design the CQRS strategy in this json format?:


        I want to create a CQRS ReadModel that collects the following data: ${me.client.input.description}
        You must design the CQRS strategy in this json format:
        {
            "ReadModel":{
              "Name":"name of readmodel entity", // Name must be english.
              "DisplayName":"name of readmodel entity", // DisplayName must be korean.
              "Properties":[
                 {"Name":"prop name", "Type":"java class name"} // Name and Type must be english name.
              ],
              "CQRSStrategy":{
                 "Operation":"Create"|"Update"|"Delete",
                 "TriggerEvent":"Event Name to do the operation on readmodel entity",
                 "DataMappings":[{
                      "SourceProperty":"property name of event source",
                      "TargetProperty":"property name of readmodel entity",
                      "Operation": "="|"+="|"-=",
                    }],
                 "CorrelationKey":{
                    "SourceProperty":"property name of event source",
                      "TargetProperty":"property name of readmodel entity"
                 }
        }
        `


    }

    createModel(text){
      var me = this
      let jsonValue
      try{
        jsonValue = super.createModel(text);

        if(jsonValue && me.events){
          var generatedModel = jsonValue.ReadModel;
          
          me.originalModel = 
          {
                  _type: 'org.uengine.modeling.model.View',
                  visuality : 'public',
                  name: '',
                  oldName: '',
                  namePascalCase: '',
                  namePlural: '',
                  aggregate: me.client.input.value.aggregate,
                  description: me.client.input.description,
                  author: me.client.input.value.author,
                  boundedContext: me.client.input.value.boundedContext,
                  fieldDescriptors: [
                      {
                          _type: "org.uengine.model.FieldDescriptor",
                          name: "id",
                          className: "Long",
                          nameCamelCase: 'id',
                          namePascalCase: 'Id',
                          isKey: true
                      }
                  ],
                  queryParameters:[],
                  queryOption:{
                      apiPath: "",
                      useDefaultUri: true,
                      multipleResult: false
                  },
                  controllerInfo: {url:""},
                  elementView: {
                      '_type': 'org.uengine.modeling.model.View',
                      'id': me.client.input.value.elementView.id,
                      'x': me.client.input.value.elementView.x,
                      'y': me.client.input.value.elementView.y,
                      'width': me.client.input.value.elementView.width,
                      'height': me.client.input.value.elementView.height,
                      'style': JSON.stringify({})
                  },
                  editingView: false,
                  dataProjection: 'cqrs',
                  createRules: [
                      {
                          _type: 'viewStoreRule',
                          operation: 'CREATE',
                          when: null,
                          fieldMapping: [{"viewField": null, "eventField": null}],
                          where: [{"viewField": null, "eventField": null}],
                      }
                  ],
                  updateRules: [
                      {
                          _type: 'viewStoreRule',
                          operation: 'UPDATE',
                          when: null,
                          fieldMapping: [{"viewField": null, "eventField": null}],
                          where: [{"viewField": null, "eventField": null}],
                      }
                  ],
                  deleteRules: [
                      {
                          _type: 'viewStoreRule',
                          operation: 'DELETE',
                          when: null,
                          fieldMapping: [{"viewField": null, "eventField": null}],
                          where: [{"viewField": null, "eventField": null}],
                      }
                  ],
          }
          
          /////////// Name
          me.originalModel.name = generatedModel.Name
          me.originalModel.displayName = generatedModel.DisplayName
  
          /////////// fieldDescriptor
          me.originalModel.fieldDescriptors = [
            {
                _type: "org.uengine.model.FieldDescriptor",
                name: "id",
                className: "Long",
                nameCamelCase: 'id',
                namePascalCase: 'Id',
                isKey: true
            }
          ] 

          if(generatedModel.Properties){
            generatedModel.Properties.forEach(function (val){
              me.originalModel.fieldDescriptors.push({
                _type:"org.uengine.model.FieldDescriptor",
                name: val.Name,
                className: val.Type,
                nameCamelCase:changeCase.camelCase(val.Name),
                namePascalCase:changeCase.pascalCase(val.Name),
                isKey: false,
              })
            })
            // originalModel.fieldDescriptors = fieldDescriptor
          }
  
          /////////// CQRS
          var whenEvent = {}
          if(generatedModel.CQRSStrategy){
            me.events.forEach(function (event){
              if(event.name == generatedModel.CQRSStrategy.TriggerEvent){
                Object.keys(me.client.input.model.elements).forEach(function (val) {
                  if(me.client.input.model.elements[val]){
                    if(me.client.input.model.elements[val].elementView.id == event.elementView.id){
                      whenEvent = me.client.input.model.elements[val];
                    }
                  }
                })
              }
            })

            if(generatedModel.CQRSStrategy.DataMappings){
              var fieldMapping = []
              generatedModel.CQRSStrategy.DataMappings.forEach(function (data){
                var obj = {
                  eventField: null,
                  operator: "",
                  viewField: null
                }

                //viewField
                obj.viewField = me.originalModel.fieldDescriptors.find((obj) => obj.name === data.TargetProperty);
                
                //eventField
                var targetEvent = whenEvent.fieldDescriptors.find((obj) => obj.name == data.SourceProperty);
                if(data.Operation == '+=' || data.Operation == '-='){
                  if(targetEvent.className=='Integer' || targetEvent.className=='Long'){
                    obj.eventField = whenEvent.fieldDescriptors.find((obj) => obj.name == data.SourceProperty);
                  }else{
                    obj.eventField = {
                      "name":"Direct-Val",
                      "className":true,
                      "value":"1"
                    }
                  }
                }else{
                  obj.eventField = whenEvent.fieldDescriptors.find((obj) => obj.name == data.SourceProperty);
                }

                //operation
                obj.operator = data.Operation;
                if(!data.Operation.includes('=')){
                  obj.operator = '='
                }
                

                fieldMapping.push(obj)
              })
      
              if(generatedModel.CQRSStrategy.Operation=="Create"){
                // originalModel.createRules = [] 
                // originalModel.createRules.push(
                //       {
                //           _type: 'viewStoreRule',
                //           operation: 'CREATE',
                //           when: whenEvent,
                //           fieldMapping: fieldMapping,
                //           where: [{"viewField": null, "eventField": null}],
                //       }
                // )
                me.originalModel.createRules[0].when = whenEvent;
                me.originalModel.createRules[0].fieldMapping = fieldMapping;
      
              }else if(generatedModel.CQRSStrategy.Operation=="Update"){
                // originalModel.updateRules = [] 
                // originalModel.updateRules.push(
                //       {
                //           _type: 'viewStoreRule',
                //           operation: 'UPDATE',
                //           when: whenEvent,
                //           fieldMapping: fieldMapping,
                //           where: [{"viewField": null, "eventField": null}],
                //       }
                // )
                me.originalModel.updateRules[0].when = whenEvent;
                me.originalModel.updateRules[0].fieldMapping = fieldMapping;
      
              }else if(generatedModel.CQRSStrategy.Operation=="Delete"){
                // originalModel.deleteRules = [] 
                // originalModel.deleteRules.push(
                //       {
                //           _type: 'viewStoreRule',
                //           operation: 'DELETE',
                //           when: whenEvent,
                //           fieldMapping: fieldMapping,
                //           where: [{"viewField": null, "eventField": null}],
                //       }
                // )
                me.originalModel.deleteRules[0].when = whenEvent;
                me.originalModel.deleteRules[0].fieldMapping = fieldMapping;
      
              }
              
            }
          }
          
          return me.originalModel;
        }
      }catch(e){
        console.log("Fail to generate Read Model:" + e)

        var obj = me.originalModel;
        return obj;
      }
    }

}


module.exports = ReadModelGenerator;