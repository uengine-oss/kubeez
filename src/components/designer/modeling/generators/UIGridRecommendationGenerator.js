const JsonAIGenerator = require("./JsonAIGenerator");

class UIGridRecommendationGenerator extends JsonAIGenerator {

    constructor(client) {
        super(client);
        this.preferredLanguage = "";
        this.readModel = client.input.readModel;
    }
    
    createPrompt() {
        let prompt = `Let's say we have following Read Model:
${this.readModel.name} {
${this.readModel.fieldDescriptors}
}
If we want draw a grid table. then which column names of the Read Model I've presented can be bound the following mapping JSON? Respond as the JSON format.
{
    columns: [ "column name" ]
}`;

        return prompt;
    }
    
}

module.exports = UIGridRecommendationGenerator;