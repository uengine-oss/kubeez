let json=`{
  "serviceName": "Taxi Calling Service",
  "actors": ["Customer", "Taxi Driver"],
  "boundedContext": {
    "taxi-management": {
      "aggregates": [
        {
          "name": "Taxi",
          "uiStyle": {
            "layout": "CARD",
            "nameProperty": "licensePlate",
            "imageUrlProperty": null,
            "mainImageDescription": null,
            "icon": null
          },
          "properties": [
            {
              "name": "licensePlate",
              "type": "String",
              "isKey": true,
              "displayName": "License Plate",
              "uiStyle": {
                "inputUI": "TEXT",
                "viewUI": "TEXT"
              }
            },
            {
              "name": "position",
              "type": "String",
              "isKey": false,
              "displayName": "Position",
              "uiStyle": {
                "inputUI": null,
                "viewUI": "TEXT"
              }
            }
          ],
          "commands": [
            {
              "name": "Call Taxi",
              "properties": [
                {
                  "name": "position",
                  "type": "String"
                }
              ],
              "api_verb": "POST",
              "api_uri": "/call-taxi",
              "actor": "Customer",
              "outputEvents": [
                "Taxi Called"
              ],
              "uiStyle": {
                "icon": "directions_car"
              }
            }
          ],
          "events": [
            {
              "name": "Taxi Called",
              "properties": [
                {
                  "name": "position",
                  "type": "String"
                }
              ]
            }
          ]
        }
      ]
    },
    "payment-management": {
      "aggregates": [
        {
          "name": "Payment",
          "uiStyle": {
            "layout": "CARD",
            "nameProperty": "id",
            "imageUrlProperty": null,
            "mainImageDescription": null,
            "icon": null
          },
          "properties": [
            {
              "name": "id",
              "type": "String",
              "isKey": true,
              "displayName": "ID",
              "uiStyle": {
                "inputUI": null,
                "viewUI": "TEXT"
              }
            },
            {
              "name": "amount",
              "type": "Double",
              "isKey": false,
              "displayName": "Amount",
              "uiStyle": {
                "inputUI": null,
                "viewUI": "TEXT"
              }
            }
          ],
          "commands": [
            {
              "name": "Charge Customer",
              "properties": [
                {
                  "name": "amount",
                  "type": "Double"
                }
              ],
              "api_verb": "POST",
              "api_uri": "/charge-customer",
              "actor": "Taxi Driver",
              "outputEvents": [
                "Payment Charged"
              ],
              "uiStyle": {
                "icon": "attach_money"
              }
            }
          ],
          "events": [
            {
              "name": "Payment Charged",
              "properties": [
                {
                  "name": "amount",
                  "type": "Double"
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
      "boundedContext": "taxi-management",
      "name": "Start Taxi Ride",
      "triggerEvents": [
        {
          "boundedContext": "taxi-management",
          "aggregate": "Taxi",
          "event": "Taxi Called"
        }
      ],
      "commands": [
        {
          "boundedContext": "payment-management",
          "aggregate": "Payment",
          "command": "Charge Customer"
        }
      ]
    }
  ]
}`;

const ESGenerator = require('./ESGenerator.js');

global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
global.window = {}
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



  let converted = generator.createModel(json);
  

});