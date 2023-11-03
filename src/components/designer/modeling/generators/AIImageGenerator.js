const AIGenerator = require("./AIGenerator");

class AIImageGenerator extends AIGenerator{

    constructor(client, options){
        super(client, options)

        this.imgList;
        this.n = 1;
        this.size = "100x100";
        if(options){
            this.n = options.n;
            this.size = options.size;
        } 

    }
    
    generate(){
        let me = this;
        let responseCnt = 0;
        
        me.imgList = null;
        me.gptResponseId = null;
        const url = "https://api.openai.com/v1/images/generations";
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + me.openaiToken);

        xhr.onprogress = function(event) {
            var currentResId
            if(me.stopSignaled){
                xhr.abort();
                me.stopSignaled = false;
            }

            const parsed = JSON.parse(xhr.responseText);

            if(parsed.error){
                if(me.client.onError){
                    me.client.onError(parsed.error);
                }
                throw new Error(parsed.error.message)
            }

            if(me.client.onReceived){
                me.client.onReceived(parsed.data);
                me.imgList = parsed.data
            }


        };

        xhr.onloadend = function() {
            console.log("End to Success - onloadend", xhr);
            if(me.client){
                me.state = 'end';
                me.client.onGenerationFinished(me.imgList)
            }
        };

                
        const data = JSON.stringify({
            "prompt": this.createPrompt(),
            "n": this.n,
            "size": this.size  //256x256
          });

        xhr.send(data);

    }

    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


}


module.exports = AIImageGenerator;