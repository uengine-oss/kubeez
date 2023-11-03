const JsonAIGenerator = require("./JsonAIGenerator");

class ESExtensionGenerator extends JsonAIGenerator{

    constructor(client){
        super(client); 
        
        this.existingModel = client.input.existingModel;
    }
    

    createExplainationOnExistingModel(){


        // client 가 EventStormingModelCanvas 라고 가정하고. 여기의 모델의 내용을 다음의 결과로 뽑기쉬운 구조가 필요:

`

`



    }


}


module.exports = ESExtensionGenerator;