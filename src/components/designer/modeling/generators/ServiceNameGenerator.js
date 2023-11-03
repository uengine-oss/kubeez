import AIGenerator from "./AIGenerator";


export default class ServiceNameGenerator extends AIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `Please create a service name for ${this.client.input.title}`
    }


}