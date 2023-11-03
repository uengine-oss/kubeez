import JsonAIGenerator from "./JsonAIGenerator";
//let partialParse = require('partial-json-parser');
let changeCase = require('change-case');


export default class BMGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);

        this.sequenceForUUID = 0;
        this.lastBCView = null;
        this.bcPosition = {};
    }
    
    createPrompt(){
        return `Please Generate a business model canvas for ${this.client.input.title}. The Response must follow this Json format:
        {
            ValueProposition: [
                "name"
            ],
            CustomerSegment: [
                "name"
            ],
            CustomerRelationship: [
                "name"
            ],
            KeyPartner: [
                "name"
            ],
            KeyActivity: [
                "name"
            ],
            KeyResource: [
                "name"
            ],
            channel: [
                "name"
            ],
            CostStructure: [
                "name"
            ],
            RevenueStream: [
                "name"
            ]
        }`
    }


    uuid() {
        // function s4() {
        //     return Math.floor((1 + Math.random()) * 0x10000)
        //         .toString(16)
        //         .substring(1);
        // }

        // return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        //     s4() + '-' + s4() + s4() + s4();

        return ""+ (++this.sequenceForUUID);
    }

    resetUUID() {
        this.sequenceForUUID = 0;
    }

    createModel(text){
        let bmVal = super.createModel(text);

        var me = this
        var elements = {}
        var eleNumber = 0
        Object.keys(bmVal).forEach(function (key){
            if(bmVal[key] && bmVal[key].length > 0){
                bmVal[key].forEach(function (eleName){
                    var eleUuid = me.uuid();
                    var element = {
                        _type: "org.uengine.modeling.business." + key,
                        dddModel: null,
                        description: "",
                        elementView: {
                            _type: "org.uengine.modeling.business." + key,
                            angle: 0,
                            height: 100,
                            id: eleUuid,
                            style: "{}",
                            width: 100,
                            x: 500,
                            y: 500,
                        },
                        label: key.toLowerCase(),
                        name: eleName,
                        componentName: key.toLowerCase(),
                        eleNumber: eleNumber
                    }
                    elements[eleUuid] = element
                    eleNumber++;
                })
            }
        })   
        
        return elements;
    }

}