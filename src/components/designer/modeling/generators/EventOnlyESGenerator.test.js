const Generator = require('./EventOnlyESGenerator.js');

//for browser simulation
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.window = {countryCode: 'ko'}


class Client{

  constructor(){
    this.input = {
      title: 'Taxi-call service' 
    }

    this.done = false;
  }

  onReceived(text){
    console.log(text);
  }

  onGenerationFinished(){
    this.done = true;
  }

}

test('EventOnlyGenerator-parsing-test', () => {

  let client = new Client();
  let generator = new Generator(client);



  let converted = generator.createModel(
`{
  "serviceName": "Taxi Calling System",
  "actors": ["Passenger", "Driver"],
  "events": [
    {
      "actor": "Passenger",
      "name": "TaxiRequested",
      "koreanName": "택시 호출하기"
    },
    {
      "actor": "Driver",
      "name": "AcceptanceStatusChecked",
      "koreanName": "운전자 수락하기"
    },
    {
      "actor": "Passenger",
      "name": "TaxiBoarded",
      "koreanName": "택시 탑승하기"
    },
    {
      "actor": "Passenger",
      "name": "PathGuided",
      "koreanName": "경로 안내하기"
    },
    {
      "actor": "Passenger",
      "name": "PaymentCompleted",
      "koreanName": "요금 결제하기"
    }
  ]
}`);
  

let displayName = Object.values(converted.elements).find(ele => ele.name === "PathGuided").displayName
expect(displayName).toBe("경로 안내하기")   //assertion


});