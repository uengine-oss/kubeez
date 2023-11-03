const JsonAIGenerator = require("./JsonAIGenerator");
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class ESGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        
        this.generateCnt = 0;
        this.modelElements = {}
        this.sequenceForUUID = 0;
        this.lastBCView = null;
        this.bcPosition = {};

        this.originalLanguage = this.preferredLanguage;
        this.preferredLanguage = "English";

        this.generationOptions = {policy: true, ui: false}
    }
    
    createPrompt(){
        this.modelElements = {}
        this.generateCnt = 0

        let eventList = []
        if(this.client.input.model){
            Object.keys(this.client.input.model.elements).forEach(key=>{
                if(key){

                    let event = this.client.input.model.elements[key]
                    if(event && event._type==="org.uengine.modeling.model.Event")
                        eventList.push(event.name)
    
                }
            
            })
        }
        
        let descriptionOfCommunicationStyle = '';

        if(this.client.input.communicationStyle === 'Orchestration')
            descriptionOfCommunicationStyle = 
                `Since I prefer the Orchestration communication style for this case, the policies tend to be in the bounded context which is orchestrator role so that it can be a centralized collaboration.`;
        else(this.client.input.communicationStyle === 'Choreography')
             descriptionOfCommunicationStyle = 
            `Since I prefer the Choreography communication style for this case, the policies tend to be in the bounded context that will do the action so that it can be a distributed collaboration`;

        let aggregateDetail = this.client.input.aggregateDetail;


        return `Please create an event storming model in json for following service: 
        ${this.client.input.userStory}

        ${eventList.length>0 ? "Don't forget to include following domain events: " + eventList.join(',') : ''}
        
        The format must be as follows:
        {
            "serviceName": "Service Name",
            "actors": ["Actor Name"],
            // The Bounded Context is must have aggregate over the one.
            // Bounded Context names must be a lower-cases and spaces are not allowed, use hypen instead.
            "boundedContext": {
                "bounded-context-name": {  
                    "${this.originalLanguage.toLowerCase()}Name: "Name in ${this.originalLanguage}", 
                    "aggregates": [ 
                        {
                            "name": "AggregateName",  // Aggregate Name must be Pascal-Case
                            "${this.originalLanguage.toLowerCase()}Name: "Aggregate Name in ${this.originalLanguage}", 
                            "${this.originalLanguage.toLowerCase()}Description: "Description about the aggregate in ${this.originalLanguage}", 
                            ${this.generationOptions.ui ? `
                            "uiStyle":{
                                "layout": "CARD" | "GRID"  | "LIST-ITEM",
                                "nameProperty": "property name for representing the object",
                                "imageUrlProperty":"property name for representing image url if exists",
                                "icon": "material design icon font name for representing this aggregate data",
                                "isRepresentingUser": true | false
                            },
                            `: ``}
                            "properties": [
                                {
                                    "name": "propertyName", // Property Name must be Camel-Case
                                    "${this.originalLanguage.toLowerCase()}Name: "Property Name in ${this.originalLanguage.toLowerCase()}", 
                                    "type": "PropertyType", // Property Type can be known java class or the Value object classes listed here: must be one of Address, Portrait, Rating, Money, Email. use simple name reduce the package name if java class name.
                                    "isKey": true or false,
                                    ${this.generationOptions.ui ? `
                                    "uiStyle":{
                                        "inputUI": "TEXT" | "SELECT" | "TEXTAREA" // proper user interface type for input this property value
                                    }`:``}

                                    "options" : ["value1", "value2"] // optional. if there are selectable options for this value.
                                }
                            ],
                            "commands": [
                                {
                                    "name": "Command Name",
                                    "${this.originalLanguage.toLowerCase()}Name: "Name in ${this.originalLanguage.toLowerCase()}", 
                                    ${this.generationOptions.properties ? `
                                    "properties": [
                                        {
                                            "name": "Property Name",
                                            "type": "Property Type"
                                        }
                                    ],
                                    `:``}
                                    "api_verb": "POST" | "DELETE" | "PUT",
                                    "isCreation": true | false, //true if this command creates new instance of the aggregate
                                    "actor": "Actor Name",
                                    "outputEvents": ["Event Name"],
                                    ${this.generationOptions.ui ? `
                                    "uiStyle":{
                                        "icon": "material design icon font name for representing this command"
                                    }`:``}

                                }
                            ],
                            
                            "events": [
                                {
                                    "name": "Event Name", // PascalCase
                                    "${this.originalLanguage.toLowerCase()}Name: "Name in ${this.originalLanguage.toLowerCase()}", 
                                    ${this.generationOptions.properties ? `
                                    "properties": [
                                        {
                                            "name": "Property Name", // Camel Case
                                            "type": "Property Type" //  Java Class Name Type
                                        }
                                    ]
                                    `:``}
                                }
                            ]
                        }
                    ]
                }
            }
            ${this.generationOptions.policy ? `
            ,
            "policies": [
                {
                    "boundedContext": "Bounded Context Name that includes this policy",
                    "name": "Policy Name",
                    "${this.originalLanguage.toLowerCase()}Name": "display Name",
                    "triggerEvents":[
                        {
                            "boundedContext": "Bounded Context Name",
                            "aggregate": "Aggregate Name",
                            "event": "Event Name"
                        }
                    ],
                    "commands":[
                        {
                            "boundedContext": "Bounded Context Name",
                            "aggregate": "Aggregate Name",
                            "command": "Command Name"
                        }
                    ]
                }
            ]`:``}
        
        }

        for generated aggregate objects, i want to set Value Object for each properties if possible.
        Class name of Value Objects must be one of Address, Money, Email, Password, File, Photo, Rating, Likes, Tags, Payment, Weather, Comment.

        The result must split into two or more different bounded contexts.
        Each bounded context interacts with each other, and domain events must flow into a service in a way that invokes the policies of other bounded context.

        ${descriptionOfCommunicationStyle}

        Please don't create the bounded context about user management or authentication.

        The result is must be only json code without natural language.
    `
    }


    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    resetUUID() {
        this.sequenceForUUID = 0;
    }


    createModel(text){
        var me = this
        let modelValue
        try {
            modelValue = super.createModel(text)
            
            var bcCnt = 0
            var heightVal = 0
            // var elements = {}
            me.lastBCView = null
            me.resetUUID();
    
            if(modelValue["boundedContext"]){
                var portNumber = 8080
                Object.keys(modelValue["boundedContext"]).forEach(function (key, bcIdx){
                    portNumber++;
                    if(portNumber == 8088) {
                        portNumber++;
                    }
                    if(me.generateCnt < bcIdx){
                        me.generateCnt = bcIdx
                    }
                    var bcMaxHeightVal = 0
                    if(bcCnt == 3){
                        heightVal++;
                        bcCnt = 0
                        me.lastBCView = null
                    }
                    bcCnt++;
                    if(!me.bcPosition[heightVal]){
                        me.bcPosition[heightVal] = null
                    }
                    ////
                    // .uuid()
                    var bcUuid = 'bc-' + key
                    if(me.generateCnt == bcIdx){
                        me.modelElements[bcUuid] = {
                            _type: "org.uengine.modeling.model.BoundedContext",
                            aggregates: [],
                            author: me.userUid,
                            description: null,
                            elementView: {
                                _type: "org.uengine.modeling.model.BoundedContext",
                                height: 590,
                                id: bcUuid,
                                style: "{}",
                                width: 560,
                                x: 400 + ((bcCnt - 1) * 600),
                                y: heightVal != 0 && (me.bcPosition[heightVal - 1]) ? me.bcPosition[heightVal - 1].height/2 + me.bcPosition[heightVal - 1].y + 335:380 + (heightVal * 610)
                            }, 
                            gitURL: null,
                            hexagonalView: {
                                _type: "org.uengine.modeling.model.BoundedContextHexagonal",
                                height: 350,
                                id: bcUuid,
                                style: "{}",
                                width: 350,
                                x: 235,
                                y: 365
                            },
                            members: [],
                            name: key,
                            displayName: modelValue["boundedContext"][key][me.originalLanguage.toLowerCase() + "Name"],
                            oldName: "",
                            policies: [],
                            portGenerated: portNumber,
                            preferredPlatform: "spring-boot",
                            preferredPlatformConf: {},
                            rotateStatus: false,
                            tempId: "",
                            templatePerElements: {},
                            views: []
                        }
                    }
                    modelValue["boundedContext"][key].eleInfo = me.modelElements[bcUuid]
                    if(modelValue["boundedContext"][key]["aggregates"]){
                        me.modelElements[bcUuid]["elementView"].width = modelValue["boundedContext"][key]["aggregates"].length * 480
                        if(me.lastBCView){
                            me.modelElements[bcUuid]["elementView"].x = me.lastBCView.x + me.lastBCView.width/2 + 20 + me.modelElements[bcUuid]["elementView"].width/2
                        } else {
                            me.modelElements[bcUuid]["elementView"].x = me.modelElements[bcUuid]["elementView"].width/2 + 120
                        }
                        me.lastBCView = me.modelElements[bcUuid]["elementView"] 
                        modelValue["boundedContext"][key]["aggregates"].forEach(function (agg, aggIdx){
                            // var aggUuid = me.uuid();
                            var aggMaxHeightVal = 0
                            var eventHeight = 0
                            var commandHeight = 0
                            var eventLength = 0
                            var commandLength = 0
                            var lastCommandView = null
    
                            if(agg["name"]){
                                var aggUuid = bcUuid + '-agg-' + agg.name
                                if(me.generateCnt == bcIdx){
                                    me.modelElements[aggUuid] = {
                                        aggregateRoot: {
                                            _type: 'org.uengine.modeling.model.AggregateRoot', 
                                            fieldDescriptors: [],
                                            entities: {}, 
                                            operations: [],
                                        },
                                        author: me.userUid,
                                        boundedContext: {
                                            name: key, 
                                            id: bcUuid
                                        },
                                        commands: [],
                                        description: null,
                                        elementView: {
                                            _type: 'org.uengine.modeling.model.Aggregate', 
                                            id: aggUuid, 
                                            // x: modelValue["boundedContext"][key]["aggregates"].length == 1 ? me.modelElements[bcUuid]["elementView"].x:390 + ((bcCnt - 1) * 600) + ((aggIdx * 380)), 
                                            x: modelValue["boundedContext"][key]["aggregates"].length == 1 ? me.modelElements[bcUuid]["elementView"].x : me.modelElements[bcUuid]["elementView"].x - me.modelElements[bcUuid]["elementView"].width/2 + 280 + (aggIdx * 480), 
                                            y: me.modelElements[bcUuid]["elementView"].y, 
                                            width: 130,
                                            height: 400,
                                            _type: "org.uengine.modeling.model.Aggregate"
                                        },
                                        events: [],
                                        hexagonalView: {
                                            _type: 'org.uengine.modeling.model.AggregateHexagonal', 
                                            id: aggUuid, 
                                            x: 0, 
                                            y: 0, 
                                            subWidth: 0,
                                            width: 0,
                                            x: 0,
                                            y: 0,
                                            _type: "org.uengine.modeling.model.AggregateHexagonal"
                                        },
                                        name: agg.name,
                                        displayName: agg[me.originalLanguage.toLowerCase() + 'Name'],
                                        nameCamelCase: changeCase.camelCase(agg.name),
                                        namePascalCase: changeCase.pascalCase(agg.name),
                                        namePlural: "",
                                        rotateStatus: false,
                                        selected: false,
                                        _type: "org.uengine.modeling.model.Aggregate"
                                    }
                                    if(agg["properties"] && agg["properties"].length > 0){
                                        agg["properties"].forEach(function (ele, idx){
                                            var field = {
                                                className: ele.type,
                                                isCopy: false,
                                                isKey: idx == 0 ? true:false,
                                                name: ele.name,
                                                displayName: ele[me.originalLanguage.toLowerCase() + 'Name'],
                                                nameCamelCase: changeCase.camelCase(ele.name),
                                                namePascalCase: changeCase.pascalCase(ele.name),
                                                _type: "org.uengine.model.FieldDescriptor",
                                                inputUI: ele.uiStyle ? ele.uiStyle.inputUI:null
                                            }
                                            me.modelElements[aggUuid].aggregateRoot.fieldDescriptors.push(field)
                                        })
                                    } else if(agg["entities"] && agg["entities"][0] && agg["entities"][0]["properties"]){
                                        agg["entities"][0]["properties"].forEach(function (ele, idx){
                                            var field = {
                                                className: ele.type,
                                                isCopy: false,
                                                isKey: idx == 0 ? true:false,
                                                name: ele.name,
                                                nameCamelCase: changeCase.camelCase(ele.name),
                                                namePascalCase: changeCase.pascalCase(ele.name),
                                                _type: "org.uengine.model.FieldDescriptor"
                                            }
                                            me.modelElements[aggUuid].aggregateRoot.fieldDescriptors.push(field)
                                        })
                                    }
                                } 
                                modelValue["boundedContext"][key]["aggregates"][aggIdx].eleInfo = me.modelElements[aggUuid]
                            }

                            if(agg["uiStyle"]){
                                me.modelElements[aggUuid].uiStyle = agg["uiStyle"];
                            }

                            me.modelElements[aggUuid].description = agg[me.originalLanguage.toLowerCase()+"Description"];


                            var firstEvent = true
                            var firstCommand = true
                            var elementUuid
                            if(agg["events"]){
                                agg["events"].forEach(function (ele, idx){
                                    elementUuid = bcUuid + '-event-' + ele.name
                                    if(firstEvent && commandHeight == 0){
                                        eventHeight = me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200
                                        firstEvent = false
                                    }
                                    eventLength = agg["events"].length
                                    if(me.generateCnt == bcIdx){
                                        me.modelElements[elementUuid] = {
                                            aggregate: {
                                                id: aggUuid
                                            },
                                            alertURL: "/static/image/symbol/alert-icon.png",
                                            author: me.userUid,
                                            boundedContext: {
                                                name: key, 
                                                id: bcUuid
                                            },
                                            checkAlert: true,
                                            description: null,
                                            elementView: {
                                                angle: 0,
                                                height: 115,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 100,
                                                x: me.modelElements[aggUuid]["elementView"].x + 90, 
                                                y: commandHeight == 0 ? me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200:commandHeight + (idx * 120), 
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
                                            displayName: ele[me.originalLanguage.toLowerCase() + 'Name'],
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
                                    }
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["events"][ele.name] = {}
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["events"][ele.name].eleInfo = me.modelElements[elementUuid]

                                    if(me.generateCnt == bcIdx){
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
                                    }
                                })
                            }

                            if(agg["commands"]){
                                agg["commands"].forEach(function (ele, idx){
                                    elementUuid = bcUuid + '-command-' + ele.name
                                    if(firstCommand && eventHeight == 0){
                                        commandHeight = me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200
                                        firstCommand = false
                                    }
                                    commandLength = agg["commands"].length
                                    if(me.generateCnt == bcIdx){
                                        me.modelElements[elementUuid] = {
                                            _type: "org.uengine.modeling.model.Command",
                                            outputEvents: ele.outputEvents,
                                            aggregate: {
                                                id: aggUuid
                                            },
                                            author: me.userUid,
                                            boundedContext: {
                                                id: bcUuid,
                                                name: key
                                            },
                                            controllerInfo: {
                                                apiPath: ele.api_uri,
                                                method: ele.api_verb
                                            },
                                            fieldDescriptors: [],
                                            description: null,
                                            elementView: {
                                                _type: "org.uengine.modeling.model.Command",
                                                height: 115,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 100,
                                                x: me.modelElements[aggUuid]["elementView"].x - 90, 
                                                y: eventHeight == 0 ? me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200:eventHeight + (idx * 120), 
                                                "z-index": 999
                                            },
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.CommandHexagonal",
                                                height: 0,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 0,
                                                x: 0,
                                                y: 0
                                            },
                                            isRestRepository: ele.api_verb == 'PUT' ? false:true,
                                            name: ele.name,
                                            displayName: ele[me.originalLanguage.toLowerCase() + 'Name'],
                                            nameCamelCase: changeCase.camelCase(ele.name),
                                            namePascalCase: changeCase.pascalCase(ele.name),
                                            namePlural: "",
                                            relationCommandInfo: [],
                                            relationEventInfo: [],
                                            restRepositoryInfo: {
                                                method: ele.api_verb ? ele.api_verb:'POST'
                                            },
                                            rotateStatus: false,
                                            selected: false,
                                            trigger: "@PrePersist",
                                        }
                                    }
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["commands"][ele.name] = {}
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["commands"][ele.name].eleInfo = me.modelElements[elementUuid]
                                    lastCommandView = me.modelElements[elementUuid]["elementView"]
                                    if(ele.actor){
                                        if(me.generateCnt == bcIdx){
                                            var actorUuid = bcUuid + '-' + elementUuid + '-actor-' + ele.actor
                                            me.modelElements[actorUuid] = {
                                                _type:"org.uengine.modeling.model.Actor",
                                                author: me.userUid,
                                                boundedContext: {
                                                    id: bcUuid,
                                                    name: key
                                                },
                                                description: null,
                                                elementView: {
                                                    _type: "org.uengine.modeling.model.Actor",
                                                    height: 100,
                                                    id: actorUuid,
                                                    style: "{}",
                                                    width: 100,
                                                    x: me.modelElements[elementUuid]['elementView'].x - 80,
                                                    y: me.modelElements[elementUuid]['elementView'].y - 40
                                                },
                                                innerAggregate: {
                                                    command: [],
                                                    event: [],
                                                    external: [],
                                                    policy: [],
                                                    view: [],
                                                },
                                                name: ele.actor,
                                                oldName: "",
                                                rotateStatus: false
                                            }
                                        }
                                    }
                                    if(me.generateCnt == bcIdx){
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
                                    }
                                })
                            }

                            var maxHeightVal = eventLength > commandLength ? eventLength:commandLength
                            if(maxHeightVal > bcMaxHeightVal){
                                bcMaxHeightVal = maxHeightVal
                                if(bcUuid && me.modelElements[bcUuid]){
                                    me.modelElements[bcUuid]["elementView"].height = me.modelElements[bcUuid]["elementView"].height > (bcMaxHeightVal * 110) + 200 ? me.modelElements[bcUuid]["elementView"].height:(bcMaxHeightVal * 110) + 200
                                    if(heightVal == 0){
                                        if(me.modelElements[bcUuid]["elementView"].height > 590){
                                            // console.log(bcUuid, ": " + me.modelElements[bcUuid]["elementView"].height - (220 + 50 * (bcMaxHeightVal - 4)))
                                            // me.modelElements[bcUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].height - (220 + 50 * (bcMaxHeightVal - 4))
                                            me.modelElements[bcUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].height/2 + 80
                                        } else {
                                            me.modelElements[bcUuid]["elementView"].y = 380
                                        }
                                    } 
                                    if(me.bcPosition[heightVal - 1]){
                                        me.modelElements[bcUuid]["elementView"].y = me.bcPosition[heightVal - 1].y + me.bcPosition[heightVal - 1].height/2 + 20 + me.modelElements[bcUuid]["elementView"].height/2
                                    } 
                                    if(!me.bcPosition[heightVal]){
                                        me.bcPosition[heightVal] = me.modelElements[bcUuid]["elementView"]
                                    } else {
                                        if(me.bcPosition[heightVal].height < me.modelElements[bcUuid]["elementView"].height){
                                            me.bcPosition[heightVal] = me.modelElements[bcUuid]["elementView"]
                                        }
                                    }
                                }
                            }    

                            aggMaxHeightVal = eventLength > commandLength ? eventLength:commandLength
                            
                            if(aggMaxHeightVal > 0){
                                if(me.modelElements[aggUuid]){
                                    me.modelElements[aggUuid]["elementView"].height = 400 > aggMaxHeightVal * 110 + aggMaxHeightVal * 8 ? 400:aggMaxHeightVal * 110 + aggMaxHeightVal * 8
                                    me.modelElements[aggUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].y
                                }
                            }
                        })
                    }
                })
                var relations = {}
                Object.keys(me.modelElements).forEach(function (key){
                    if(me.modelElements[key]._type == "org.uengine.modeling.model.Command" && (me.modelElements[key].outputEvents && me.modelElements[key].outputEvents.length > 0)){
                        me.modelElements[key].outputEvents.forEach(function (eventName){
                            Object.keys(me.modelElements).some(function (key2){
                                if(eventName == me.modelElements[key2].name){
                                    if(me.modelElements[key2]['aggregate'] && me.modelElements[key]['aggregate'].id == me.modelElements[key2]['aggregate'].id){
                                        var relUuid = me.uuid();
                                        relations[relUuid] = {
                                            _type: "org.uengine.modeling.model.Relation",
                                            from: key,
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.RelationHexagonal",
                                                from: key,
                                                id: relUuid,
                                                needReconnect: true,
                                                style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                to: key2,
                                                value: null
                                            },
                                            name: "",
                                            relationView: {
                                                from: key,
                                                id: relUuid,
                                                needReconnect: true,
                                                style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                to: key2,
                                                value: "[]"
                                            },
                                            sourceElement: me.modelElements[key],
                                            sourceMultiplicity: 1,
                                            targetElement: me.modelElements[key2],
                                            targetMultiplicity: 1,
                                            to: key2
                                        }
                                    }
                                }
                            })
                        })  
                    } 
                }); 
                if(me.state == 'end'){
                    // policy
                    if(modelValue["policies"]){
                        let isOrchestrationCnt = 0
                        modelValue["policies"].forEach(function (policy){
                            var isPolicyType = null
                            let policyUuid = me.uuid();
                            let refEle = null
                            let elementView = {}
                            let cmdInfo = []
                            let evnInfo = null

                            if(policy.commands && policy.commands.length > 0){
                                // !command ? add command:null
                                policy.commands.forEach(function (cmd){
                                    var cmdAggIdx = modelValue["boundedContext"][cmd.boundedContext]["aggregates"].findIndex(x => x.name == cmd.aggregate)
                                    if(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx] && !modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"]){
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"] = {}
                                    }
                                    if(!modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command]){
                                        var elementUuid = me.uuid();
                                        me.modelElements[elementUuid] = {
                                            _type: "org.uengine.modeling.model.Command",
                                            outputEvents: null,
                                            aggregate: {
                                                id: modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id
                                            },
                                            author: me.userUid,
                                            boundedContext: {
                                                name: modelValue["boundedContext"][cmd.boundedContext]["eleInfo"].name, 
                                                id: modelValue["boundedContext"][cmd.boundedContext]["eleInfo"]["elementView"].id
                                            },
                                            controllerInfo: {
                                                apiPath: null,
                                                method: "PUT"
                                            },
                                            fieldDescriptors: [],
                                            description: null,
                                            elementView: {
                                                _type: "org.uengine.modeling.model.Command",
                                                height: 115,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 100,
                                                x: me.modelElements[modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id]["elementView"].x - 90, 
                                                y: me.modelElements[modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id]["elementView"].y + (modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"].length * 120) - 200, 
                                                "z-index": 999
                                            },
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.CommandHexagonal",
                                                height: 0,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 0,
                                                x: 0,
                                                y: 0
                                            },
                                            isRestRepository: true,
                                            name: cmd.command,
                                            nameCamelCase: changeCase.camelCase(cmd.command),
                                            namePascalCase: changeCase.pascalCase(cmd.command),
                                            namePlural: "",
                                            relationCommandInfo: [],
                                            relationEventInfo: [],
                                            restRepositoryInfo: {
                                                method: "POST"
                                            },
                                            rotateStatus: false,
                                            selected: false,
                                            trigger: "@PrePersist",
                                        }
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command] = {}
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo = me.modelElements[elementUuid]
                                    }
                                    if(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo){
                                        cmdInfo.push(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo)            
                                    }
                                })

                                // add policy 
                                if(policy.triggerEvents && policy.triggerEvents.length > 0){
                                    var aggIdx
                                    var checkDiffAggName = policy.commands.find(x => x.aggregate != policy.commands[0].aggregate)
                                    if(policy.commands.length > 1 && checkDiffAggName){
                                        isPolicyType = "orchestration"
                                        refEle = policy.triggerEvents[0]
                                        aggIdx = modelValue["boundedContext"][refEle.boundedContext]["aggregates"].findIndex(x => x.name == refEle.aggregate)
                                        elementView = {
                                            height: 115,
                                            width: 100,
                                            x: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["events"][refEle.event]["eleInfo"]["elementView"].x,
                                            y: me.modelElements[modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["eleInfo"]["elementView"].id]["elementView"].y + ((modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["events"].length + isOrchestrationCnt) * 120) - 200,
                                            id: policyUuid,
                                            style: "{}",
                                            _type: "org.uengine.modeling.model.Policy"
                                        }
                                        isOrchestrationCnt++;
                                        
                                    } else {
                                        isPolicyType = "choreography"
                                        refEle = policy.commands[0]
                                        aggIdx = modelValue["boundedContext"][refEle.boundedContext]["aggregates"].findIndex(x => x.name == refEle.aggregate)
                                        elementView = {
                                            height: 115,
                                            width: 100,
                                            x: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["commands"][refEle.command]["eleInfo"]["elementView"].x - 80,
                                            y: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["commands"][refEle.command]["eleInfo"]["elementView"].y - 33,
                                            id: policyUuid,
                                            style: "{}",
                                            _type: "org.uengine.modeling.model.Policy"
                                        }
                                    }
                                    if(modelValue["boundedContext"][policy.triggerEvents[0].boundedContext]["aggregates"][aggIdx]["events"][policy.triggerEvents[0].event].eleInfo){
                                        evnInfo = modelValue["boundedContext"][policy.triggerEvents[0].boundedContext]["aggregates"][aggIdx]["events"][policy.triggerEvents[0].event].eleInfo
                                    }

                                    me.modelElements[policyUuid] = {
                                        author: me.userUid,
                                        boundedContext: {
                                            name: modelValue["boundedContext"][refEle.boundedContext]["eleInfo"].name, 
                                            id: modelValue["boundedContext"][refEle.boundedContext]["eleInfo"]["elementView"].id
                                        },
                                        description: null,
                                        elementView: elementView,
                                        fieldDescriptors: [],
                                        hexagonalView: {
                                            height: 20,
                                            id: policyUuid,
                                            style: "{}",
                                            subWidth: 100,
                                            width: 20,
                                            _type: "org.uengine.modeling.model.PolicyHexagonal"
                                        },
                                        isSaga: false,
                                        name: policy.name,
                                        displayName: policy[me.originalLanguage.toLowerCase() + "Name"],
                                        nameCamelCase: changeCase.camelCase(policy.name),
                                        namePascalCase: changeCase.pascalCase(policy.name),
                                        namePlural: "",
                                        oldName: "",
                                        rotateStatus: false,
                                        _type: "org.uengine.modeling.model.Policy"
                                    }                                    
                                }
                            }
                            

                            // add relation command.length
                            if(cmdInfo && cmdInfo.length > 0 && evnInfo){
                                cmdInfo.forEach(function (command){
                                    var relUuidPtoC = me.uuid();
                                    relations[relUuidPtoC] = {
                                        _type: "org.uengine.modeling.model.Relation",
                                        from: policyUuid,
                                        hexagonalView: {
                                            _type: "org.uengine.modeling.model.RelationHexagonal",
                                            from: policyUuid,
                                            id: relUuidPtoC,
                                            needReconnect: true,
                                            style: `{"arrow-start":"none","arrow-end":"none"}`,
                                            to: command["elementView"].id,
                                            value: null
                                        },
                                        name: "",
                                        relationView: {
                                            from: policyUuid,
                                            id: relUuidPtoC,
                                            needReconnect: true,
                                            style: `{"arrow-start":"none","arrow-end":"none"}`,
                                            to: command["elementView"].id,
                                            value: "[]"
                                        },
                                        sourceElement: me.modelElements[policyUuid],
                                        sourceMultiplicity: 1,
                                        targetElement: me.modelElements[command["elementView"].id],
                                        targetMultiplicity: 1,
                                        to: command["elementView"].id
                                    }
                                })
                                var relUuidEtoP = me.uuid();
                                relations[relUuidEtoP] = {
                                    _type: "org.uengine.modeling.model.Relation",
                                    from: evnInfo["elementView"].id,
                                    hexagonalView: {
                                        _type: "org.uengine.modeling.model.RelationHexagonal",
                                        from: evnInfo["elementView"].id,
                                        id: relUuidEtoP,
                                        needReconnect: true,
                                        style: `{"arrow-start":"none","arrow-end":"none"}`,
                                        to: policyUuid,
                                        value: null
                                    },
                                    name: "",
                                    relationView: {
                                        from: evnInfo["elementView"].id,
                                        id: relUuidEtoP,
                                        needReconnect: true,
                                        style: `{"arrow-start":"none","arrow-end":"none"}`,
                                        to: policyUuid,
                                        value: "[]"
                                    },
                                    sourceElement: me.modelElements[evnInfo["elementView"].id],
                                    sourceMultiplicity: 1,
                                    targetElement: me.modelElements[policyUuid],
                                    targetMultiplicity: 1,
                                    to: policyUuid
                                }

                            } 
                        })
                    }

                    // Payment, Money, Address, ....
                    

                    // aggregate
                    Object.keys(me.modelElements).forEach(function (key){
                        if(me.modelElements[key]._type == "org.uengine.modeling.model.Aggregate") {
                            me.modelElements[key].aggregateRoot.fieldDescriptors.forEach(function (fieldDescriptor) {
                                Object.keys(me.modelElements).forEach(function (uuid){
                                    if(me.modelElements[uuid]._type == "org.uengine.modeling.model.Aggregate" && key != uuid) {
                                        if(fieldDescriptor.className == me.modelElements[uuid].name) {
                                            var relUuidAtoA = me.uuid();
                                            relations[relUuidAtoA] = {
                                                _type: "org.uengine.modeling.model.Relation",
                                                from: key,
                                                hexagonalView: {
                                                    _type: "org.uengine.modeling.model.RelationHexagonal",
                                                    from: key,
                                                    id: relUuidAtoA,
                                                    needReconnect: true,
                                                    style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                    to: uuid,
                                                    value: null
                                                },
                                                name: "",
                                                relationView: {
                                                    from: key,
                                                    id: relUuidAtoA,
                                                    needReconnect: true,
                                                    style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                    to: uuid,
                                                    value: "[]"
                                                },
                                                sourceElement: me.modelElements[key],
                                                sourceMultiplicity: 1,
                                                targetElement: me.modelElements[uuid],
                                                targetMultiplicity: 1,
                                                to: uuid
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    });
                }

                // if(option == 'end'){
                //     var elementsList = {}
                //     Object.keys(me.modelElements).forEach(function (key){
                //         var eleUuid = me.uuid();
                //         elementsList[eleUuid] = me.modelElements[key]
                //     })
                // } else {
                //     var elementsList = me.modelElements
                // }
                var obj = {
                    projectName: modelValue["serviceName"],
                    elements: me.modelElements,
                    relations: relations,
                    uiStyle: me.client.input.uiStyle
                }
    
                return obj;
            } 
        } catch(e){
            console.log(e)
            var obj = {
                projectName: modelValue ? modelValue["serviceName"] : "untitle",
                elements: me.modelElements ? me.modelElements : {},
                relations: relations ? relations : {},
                uiStyle: me.client.input.uiStyle
            }

            return obj;
        }
    }

}


module.exports = ESGenerator;