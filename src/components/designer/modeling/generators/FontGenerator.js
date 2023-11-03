import JsonAIGenerator from "./JsonAIGenerator";


export default class FontGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `
        Please recommend font set for the service: 

        ${this.client.input.title}

        The result should in this JSON format:

        [{
          "fontTitle": "title of font set",
          "fontFamilyName": "exact font family name",
          "recommendedReason": "reason why recommended"
         },
         
        ]
`
    }

    
}