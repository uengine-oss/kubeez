const JsonAIGenerator = require("./JsonAIGenerator");

class UIChartFieldGenerator extends JsonAIGenerator {

    constructor(client) {
        super(client);
        this.preferredLanguage = "";
        this.readModel = client.input.readModel;
        this.chartType = client.input.chartType;
    }
    
    createPrompt() {
        let prompt = `Let's say we have following Read Model:
${this.readModel.name} {
${this.readModel.fieldDescriptors}
}
If we want draw a simple ${this.chartType} chart. then which column names of the Read Model I've presented can be bound the following mapping JSON? Respond as the JSON format.
{
    data: [ "data column name" ],
    category: [ "category column name" ]
}`;

        return prompt;
    }
    
}

module.exports = UIChartFieldGenerator;