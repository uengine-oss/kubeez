import JsonAIGenerator from "./JsonAIGenerator";


export default class CJMGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
        this.forEventStorming = false;
    }
    
    createPrompt(){
        return `
please generate a Customer Journey Map :

for service: 
    ${this.client.input.title}
for persona:
    ${this.client.input.persona}
    ${this.client.input.personaDescription}
for scenario:
    ${this.client.input.scneario}


Result Format JSON:
 {
   "persona": "Persona Name",
   "phases": [
     {
       "name": "Phase Name",
       "userActions":[
         {
           "name": "User Action1",
           "touchPoint": "Touch Point Name",
           "painPoint": "Pain Point",
           "possibleSolution": "solution1"
         }
       ]
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
        let model = super.createModel(text);
        
        var me = this 

        let convertedModel = {
            elements: {},
            relations: {}
        }

        let eleView = {}
        let phasePos = 0;
        
        const BORDER = 20;
        const HEIGHT = 70;
        const START_Y = 180;
        let lastPhaseX = 200;
        const WIDTH = 170;

        let textEleName = ['Phases', 'User Actions', 'Touch Points', 'Pain Points', 'PossibleSolutions']
        for(var i = 0; i < 5; i++){
            let textUuid = me.uuid();
            convertedModel.elements[textUuid] = {
                _type: "org.uengine.modeling.model.Text",
                author: null,
                description: "",
                elementView: {
                    _type: "org.uengine.modeling.model.Text",
                    angle: 0,
                    height: 15,
                    id: textUuid,
                    style: "{}",
                    width: 35,
                    x: 125,
                    y: 180 + (i * 90),
    
                },
                imgSrc: "https://www.msaez.io:8081/static/image/symbol/text_element.png",
                name : textEleName[i],
                oldName: "Text"
            }
        }

        let actorUUID = me.uuid();
        convertedModel.elements[actorUUID] = {
                    name: model.persona,
                    _type: me.forEventStorming ? "org.uengine.modeling.model.Actor": "Persona",
                    elementView: {
                        height: HEIGHT,
                        id: actorUUID,
                        style: "{}",
                        width: WIDTH / 2,
                        x: lastPhaseX,
                        y: START_Y - 50
                    }
                };


        if(model.phases){
            model.phases.forEach(function (phase, index){

                let phaseUuid = me.uuid();
                let width
                if(phase.userActions && phase.userActions.length){
                    width = (WIDTH + BORDER) * phase.userActions.length - BORDER;
                } else {
                    width = (WIDTH + BORDER) * BORDER;
                }
                convertedModel.elements[phaseUuid] = {
                    name: phase.name,
                    _type: me.forEventStorming ? "org.uengine.modeling.model.Issue": "Phase",
                    elementView: {
                        height: HEIGHT,
                        id: phaseUuid,
                        style: "{}",
                        width: width,
                        x: lastPhaseX + width / 2,
                        y: START_Y
                    }
                };

                phase.userActions.forEach((userAction, index) => {
                        
                    let userActionUuid = me.uuid();

                    let view = 
                        {
                            height: HEIGHT,
                            id: userActionUuid,
                            style: "{}",
                            width: WIDTH,
                            x: lastPhaseX + (BORDER + WIDTH) * index + WIDTH / 2,
                            y: START_Y + (HEIGHT + BORDER) * 1
                        }

                    convertedModel.elements[userActionUuid] = {
                        name: userAction.name,
                        _type: me.forEventStorming ? 
                                "org.uengine.modeling.model.Command": "UserAction",
                        elementView: view
                    };

                    let uuid = me.uuid();
                    view = JSON.parse(JSON.stringify(view));
                    view.id = uuid;
                    view.y = START_Y + (HEIGHT + BORDER) * 2;

                    convertedModel.elements[uuid] = {
                        name: userAction.touchPoint,
                        _type: me.forEventStorming ? 
                                "org.uengine.modeling.model.View" : "TouchPoint",
                        elementView: view
                    };

                    uuid = me.uuid();
                    view = JSON.parse(JSON.stringify(view));
                    view.id = uuid;
                    view.height = HEIGHT + HEIGHT/2;
                    view.y = START_Y + (HEIGHT + BORDER) * 3 + HEIGHT/2;

                    convertedModel.elements[uuid] = {
                        name: userAction.painPoint,
                        _type: me.forEventStorming ? 
                                "org.uengine.modeling.model.Issue" : "PainPoint",
                        elementView: view
                    };

                    uuid = me.uuid();
                    view = JSON.parse(JSON.stringify(view));
                    view.id = uuid;
                    view.height = HEIGHT * 2
                    view.y = START_Y + (HEIGHT + BORDER) * 5;

                    convertedModel.elements[uuid] = {
                        name: userAction.possibleSolution,
                        _type:  me.forEventStorming ? 
                                "org.uengine.modeling.model.External" : "PossibleSolution",
                        elementView: view,
                        controllerInfo: {}
                    };
                });


                lastPhaseX = lastPhaseX + BORDER + width;


            });
        }

        return convertedModel;
    }



}