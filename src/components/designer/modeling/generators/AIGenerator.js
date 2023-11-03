
class AIGenerator{

    constructor(client, options){
        this.client = client;
        this.finish_reason = null;
        this.modelJson = null;
        this.stopSignaled = false;
        this.gptResponseId = null;
        this.openaiToken = "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";

        if(options){
            this.preferredLanguage = options.preferredLanguage;
            this.previousMessages = options.previousMessages;
            this.prompt = options.prompt;
        } 

        if(!this.previousMessages)
            this.previousMessages = [];

        
        if(!this.preferredLanguage){
            this.preferredLanguage="English"

            if(window && window.countryCode == 'ko') this.preferredLanguage="Korean"

        }

    }
    
    createPrompt(){
        return this.prompt ? this.prompt : "say hello in Korean.";
    }

    stop(){
        this.stopSignaled = true;
    }

    generate(){
        this.state = 'running'
        let me = this;
        let responseCnt = 0;
        
        me.gptResponseId = null;
        const url = "https://api.openai.com/v1/chat/completions";
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + me.openaiToken);

        xhr.onprogress = function(event) {
            var currentResId
            if(me.stopSignaled){
                xhr.abort();
                me.stopSignaled = false;
                me.state = 'stopped'
            }
        // console.log("Received " + event.loaded + " bytes of data.");
        // console.log("Data: " + xhr.responseText);
            const newUpdates = xhr.responseText
            .replace("data: [DONE]", "")
            .trim()
            .split('data: ')
            .filter(Boolean)

            const newUpdatesParsed = newUpdates.map((update) => {
                const parsed = JSON.parse(update);

                if(parsed.error){
                    if(me.client.onError){
                        me.client.onError(parsed.error);
                    }
                    throw new Error(parsed.error.message)
                }

                currentResId = parsed.id
                if(!me.gptResponseId){
                    me.gptResponseId = parsed.id
                } 
                if(parsed.choices[0].finish_reason == 'length'){
                    me.finish_reason = 'length'
                }
                return parsed.choices[0].delta.content || '';
            });

            const newUpdatesJoined = newUpdatesParsed.join('')
            if(newUpdatesJoined.includes(": null")){
                newUpdatesJoined.replaceAll(": null", ": 'null'")
            }
            me.modelJson = newUpdatesJoined

            if(me.client.onReceived){
                if(me.gptResponseId == currentResId){
                    me.client.onReceived(newUpdatesJoined);
                }
            }

            if(me.client.onModelCreated){
                if(responseCnt > 15){
                    me.client.onModelCreated(me.createModel(newUpdatesJoined));
                    responseCnt = 0;
                } else {
                    responseCnt++;
                }
            }


        };

        xhr.onloadend = function() {
            console.log("End to Success - onloadend", xhr);
            if(me.client){
                if(me.finish_reason == 'length'){
                    // me.continue();
                    console.log('max_token issue')
                } 
                // else {

                    me.state = 'end';
                    let model = null;
                    if(me.client.onModelCreated){
                        model = me.createModel(me.modelJson)
                        me.client.onModelCreated(model);
                    } 
                    // else {
                    if(me.client.onGenerationFinished)
                        me.client.onGenerationFinished(model)
                    // }
                    // if (xhr.status === 0){
                        //     me.client.onGenerationFinished()
                        // } else {
                    // }
                // }
            }
        };

        
        let messages = this.createMessages();

        if(this.isContinued) messages[messages.length-1].content = "continue";

        
        const data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true,
        });

        xhr.send(data);

    }

    createMessages(){
        var me = this 
        me.previousMessages = []
        if(me.client.openAiMessageList){
            me.client.openAiMessageList.push({
                role: 'user',
                content: me.createPrompt()  + (me.preferredLanguage ? "\n please generate in " + me.preferredLanguage : '')
            })
            me.previousMessages = me.client.openAiMessageList;
        } else {
            me.previousMessages.push({
                role: 'user',
                content: me.createPrompt()  + (me.preferredLanguage ? "\n please generate in " + me.preferredLanguage : '')
            })
        }
        // console.log(me.previousMessages)
        return me.previousMessages;
    }

    continue(){
        this.isContinued = true;
        this.generate();
    }

    createModel(text){
        return text;
    }


}


module.exports = AIGenerator;