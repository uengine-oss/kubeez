const JsonAIGenerator = require("./JsonAIGenerator");

class UIChartRecommendationGenerator extends JsonAIGenerator {

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
What kind of charts will be recommended for the aggregate? and why?
JSON format most be like following:
[{
    chartType: 'Bar' | 'Pie' | 'Line' | 'Radar',
    reason: 'why recommended'
}]`;

        return prompt;
    }

    
}

module.exports = UIChartRecommendationGenerator;