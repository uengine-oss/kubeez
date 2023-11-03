import JsonAIGenerator from "./JsonAIGenerator";


export default class CJMPersonaGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `
for service: 
    ${this.client.input.title}
                
 please list persona names and describe them in this json format:
 
 [{"persona": "persona Name", "description": "long description including ages, bio, and status"}, "gender": "male" | "female", "job": "Job Title", "age": number, "scenario": "user scenario"}]
 `
    }





}