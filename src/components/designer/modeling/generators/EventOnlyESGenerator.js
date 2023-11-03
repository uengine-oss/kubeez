const ESGenerator = require("./ESGenerator");
const JsonAIGenerator = require("./JsonAIGenerator");
let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class EventOnlyESGenerator extends ESGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `Please create an event storming model in json for following service: 
        
        ${this.client.input.userStory}


        The result must be in JSON format and the name of events must be in "Adjectivalized Object" that means In this structure, the object, which is used in verb form, is transformed into an adjective and comes first, followed by the past tense verb.
        for example, "OrderPlaced", "PaymentCompleted", "JobDone". not "Placed Order", "Complete Payment", "Do Job".
        Event Names must be less than 3 words.
        : 
        
        {
            "serviceName": "Service Name",
            "actors": ["Actor Name"],
            "events": [

                {
                    "actor": "Actor Name",
                    "name": "Event Name", // must be in Past tense. i.e. Order Placed (p.p.).  Less than 3 words.
                    "${this.originalLanguage}Name": "name in ${this.originalLanguage}", // must be in Past tense. i.e. 택시 호출됨. (p.p.).
                }
            ]
        
        }
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

    createModel(text){
        var me = this
        let modelValue
       // try {
            modelValue = partialParse(text)

            
            me.lastBCView = null
            let elementUuid = ""
            me.modelElements = {};
    
            if(modelValue["events"]){
                modelValue["events"].forEach(function (ele, idx){
                    elementUuid = me.uuid();
                    me.modelElements[elementUuid] = me.createEvent(
                        ele,
                        elementUuid,
                        150 + idx * 150, 
                        300
                    );
                })

                var obj = {
                    projectName: modelValue["serviceName"],
                    elements: me.modelElements,
                    relations: {},
                    uiStyle: me.client.input.uiStyle
                }
    
                return obj;
            } 
        // } catch(e){
        //     console.log(e)
        //     var obj = {
        //         projectName: modelValue ? modelValue["serviceName"] : "untitled",
        //         elements: me.modelElements ? me.modelElements : {},
        //         relations: {},
        //         uiStyle: me.client.input.uiStyle
        //     }

        //     return obj;
        // }
    }

}


module.exports = EventOnlyESGenerator;