import AIGenerator from "./AIGenerator";
let partialParse = require('partial-json-parser');


export default class ImageDescriptionGenerator extends AIGenerator{

    constructor(client){
        super(client);
        this.preferredLanguage = "English";
    }
    
    createPrompt(){
        return `Please create an image generation description for ${this.client.input.title} \n\n  Please generate within 100 words. `
    }


}