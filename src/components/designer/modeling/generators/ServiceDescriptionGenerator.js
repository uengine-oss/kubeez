import AIGenerator from "./AIGenerator";
let partialParse = require('partial-json-parser');


export default class ServiceDescriptionGenerator extends AIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `Please create a commercial copy of service for ${this.client.input.title} \n\n  Please generate within 50 words. `
    }


}