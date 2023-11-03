const ESGenerator = require('./ESGenerator.js');

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.window = {}
// class ContinueTestGenerator extends ESGenerator{

//   constructor(client){
//     super(client);


//   }



// }

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

test('ESGenerator-parsing-test', () => {

  let client = new Client();
  let generator = new ESGenerator(client);

  generator.state = 'end';

  let converted = generator.createModel(
`{
  "serviceName": "Taxi Dispatch System",
  "actors": ["Customer", "Taxi Driver"],
  "boundedContext": {
      "taxi-calling-management": {
          "aggregates": [
              {
                  "name": "TaxiCall",
                  "uiStyle": {
                      "layout": "CARD",
                      "nameProperty": "callId",
                      "icon": "local_taxi"
                  },
                  "properties": [
                      {
                          "name": "callId",
                          "type": "String",
                          "isKey": true,
                          "displayName": "Call ID",
                          "uiStyle": {
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "customerLocation",
                          "type": "String",
                          "displayName": "Customer Location",
                          "uiStyle": {
                              "inputUI": "TEXT",
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "destination",
                          "type": "String",
                          "displayName": "Destination",
                          "uiStyle": {
                              "inputUI": "TEXT",
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "acceptedByDriver",
                          "type": "Boolean",
                          "displayName": "Accepted by Driver",
                          "uiStyle": {
                              "viewUI": "TEXT"
                          }
                      }
                  ],
                  "commands": [
                      {
                          "name": "CreateTaxiCall",
                          "properties": [
                              {
                                  "name": "customerLocation",
                                  "type": "String"
                              },
                              {
                                  "name": "destination",
                                  "type": "String"
                              }
                          ],
                          "api_verb": "POST",
                          "api_uri": "/calls",
                          "actor": "Customer",
                          "outputEvents": ["CallCreated"],
                          "uiStyle": {
                              "icon": "add_circle_outline"
                          }
                      },
                      {
                          "name": "AcceptTaxiCall",
                          "properties": [
                              {
                                  "name": "callId",
                                  "type": "String"
                              }
                          ],
                          "api_verb": "PUT",
                          "api_uri": "/calls/{callId}",
                          "actor": "Taxi Driver",
                          "outputEvents": ["CallAccepted"],
                          "uiStyle": {
                              "icon": "thumb_up"
                          }
                      }
                  ],
                  "events": [
                      {
                          "name": "CallCreated",
                          "properties": [
                              {
                                  "name": "callId",
                                  "type": "String"
                              },
                              {
                                  "name": "customerLocation",
                                  "type": "String"
                              },
                              {
                                  "name": "destination",
                                  "type": "String"
                              }
                          ]
                      },
                      {
                          "name": "CallAccepted",
                          "properties": [
                              {
                                  "name": "callId",
                                  "type": "String"
                              }
                          ]
                      }
                  ]
              }
          ]
      },
      "taxi-operation-management": {
          "aggregates": [
              {
                  "name": "TaxiOperation",
                  "uiStyle": {
                      "layout": "CARD",
                      "nameProperty": "driverId",
                      "icon": "drive_eta"
                  },
                  "properties": [
                      {
                          "name": "driverId",
                          "type": "Integer",
                          "isKey": true,
                          "displayName": "Driver ID",
                          "uiStyle": {
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "latitude",
                          "type": "Double",
                          "displayName": "Latitude",
                          "uiStyle": {
                              "inputUI": "TEXT",
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "longitude",
                          "type": "Double",
                          "displayName": "Longitude",
                          "uiStyle": {
                              "inputUI": "TEXT",
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "onRide",
                          "type": "Boolean",
                          "displayName": "On Ride",
                          "uiStyle": {
                              "viewUI": "TEXT"
                          }
                      },
                      {
                          "name": "rideId",
                          "type": "String",
                          "displayName": "Ride ID",
                          "uiStyle": {
                              "viewUI": "TEXT"
                          }
                      }
                  ],
                  "events": [
                      {
                          "name": "DriverLocationChanged",
                          "properties": [
                              {
                                  "name": "driverId",
                                  "type": "Integer"
                              },
                              {
                                  "name": "latitude",
                                  "type": "Double"
                              },
                              {
                                  "name": "longitude",
                                  "type": "Double"
                              }
                          ]
                      },
                      {
                          "name": "RideStarted",
                          "properties": [
                              {
                                  "name": "driverId",
                                  "type": "Integer"
                              },
                              {
                                  "name": "rideId",
                                  "type": "String"
                              }
                          ]
                      },
                      {
                          "name": "RideFinished",
                          "properties": [
                              {
                                  "name": "driverId",
                                  "type": "Integer"
                              },
                              {
                                  "name": "rideId",
                                  "type": "String"
                              }
                          ]
                      }
                  ]
              }
          ]
      }
  },
  "policies": [
      {
          "boundedContext": "taxi-operation-management",
          "name": "DriverOnRide",
          "triggerEvents":[
              {
                  "boundedContext": "taxi-calling-management",
                  "aggregate": "TaxiCall",
                  "event": "CallAccepted"
              }
          ],
          "commands":[
              {
                  "boundedContext": "taxi-operation-management",
                  "aggregate": "TaxiOperation",
                  "command": "StartRide"
              }
          ]
      }
  ]
}`);
  
let policy = Object.values(converted.elements).find(ele => ele.name === "DriverOnRide")
expect(policy._type).toBe("org.uengine.modeling.model.Policy")

let aggregate = Object.values(converted.elements).find(ele => ele.name === "TaxiCall")
expect(aggregate.uiStyle.icon).toBe("local_taxi")
});