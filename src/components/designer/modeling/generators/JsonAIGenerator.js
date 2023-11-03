const AIGenerator = require("./AIGenerator");

let partialParse;
try{
    partialParse = require('./partial-json-parser');

}catch(e){
    partialParse = function(text){return JSON.parse(text)}
}


class JsonAIGenerator extends AIGenerator{

    constructor(client, language){
        super(client, language);
    }

    createMessages(){
        let messages = super.createMessages();
        if(messages)
            messages[messages.length - 1].content += ". Please generate the json in valid json format and if there's a property its value is null, don't contain the property. also, Please return only the json without any natural language."

        return messages;
    }
    createModel(text){
        //console.log(text);
        let model
        try{
            // text = text.replace(/"[\w\s]+":\s*null,?/g, '');
            // text = text.replace(/"[\w\s]+":\s*null?/g, '');
            model = partialParse(text);

            return model;
        }catch(e){
            console.log("error to parse:" + text);

            throw e;
        }
    }

}

module.exports = JsonAIGenerator;