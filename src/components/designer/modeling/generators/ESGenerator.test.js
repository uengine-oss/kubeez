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



  let converted = generator.createModel(
`{
    "serviceName": "Taxi Booking Service",
    "actors": [
      "Passenger",
      "Driver"
    ],
    "boundedContext": {
      "passenger-management": {
        "aggregates": [
          {
            "name": "Passenger",
            "uiStyle": {
              "layout": "CARD",
              "nameProperty": "firstName",
              "imageUrlProperty": "profileImageUrl",
              "mainImageDescription": null,
              "icon": "account_circle"
            },
            "properties": [
              {
                "name": "id",
                "type": "Long",
                "isKey": true,
                "displayName": "ID",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "firstName",
                "type": "String",
                "isKey": false,
                "displayName": "First Name",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "lastName",
                "type": "String",
                "isKey": false,
                "displayName": "Last Name",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "phoneNumber",
                "type": "String",
                "isKey": false,
                "displayName": "Phone Number",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                },
                "options": ["123", "456", "789"]
              }
            ],
            "commands": [
              {
                "name": "CreatePassengerCommand",
                "properties": [
                  {
                    "name": "firstName",
                    "type": "String"
                  },
                  {
                    "name": "lastName",
                    "type": "String"
                  },
                  {
                    "name": "phoneNumber",
                    "type": "String"
                  }
                ],
                "api_verb": "POST",
                "api_uri": "/passengers",
                "actor": "Passenger",
                "outputEvents": [
                  "PassengerCreated"
                ]
              }
            ],
            "events": [
              {
                "name": "PassengerCreated",
                "properties": [
                  {
                    "name": "id",
                    "type": "Long"
                  }
                ]
              }
            ]
          }
        ]
      },
      "driver-management": {
        "aggregates": [
          {
            "name": "Driver",
            "uiStyle": {
              "layout": "CARD",
              "nameProperty": "name",
              "imageUrlProperty": "profileImageUrl",
              "mainImageDescription": "description of image",
              "icon": "drive_eta"
            },
            "properties": [
              {
                "name": "id",
                "type": "Long",
                "isKey": true,
                "displayName": "ID",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "name",
                "type": "String",
                "isKey": false,
                "displayName": "Name",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "phoneNumber",
                "type": "String",
                "isKey": false,
                "displayName": "Phone Number",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              }
            ],
            "commands": [
              {
                "name": "CreateDriverCommand",
                "properties": [
                  {
                    "name": "name",
                    "type": "String"
                  },
                  {
                    "name": "phoneNumber",
                    "type": "String"
                  }
                ],
                "api_verb": "POST",
                "api_uri": "/drivers",
                "actor": "Driver",
                "outputEvents": [
                  "DriverCreated"
                ]
              }
            ],
            "events": [
              {
                "name": "DriverCreated",
                "properties": [
                  {
                    "name": "id",
                    "type": "Long"
                  }
                ]
              }
            ]
          }
        ]
      },
      "taxi-booking": {
        "aggregates": [
          {
            "name": "Booking",
            "uiStyle": {
              "layout": "CARD",
              "nameProperty": "id",
              "icon": "bookmark"
            },
            "properties": [
              {
                "name": "id",
                "type": "Long",
                "isKey": true,
                "displayName": "ID",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "passengerId",
                "type": "Long",
                "isKey": false,
                "displayName": "Passenger ID",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "driverId",
                "type": "Long",
                "isKey": false,
                "displayName": "Driver ID",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "pickUpLocation",
                "type": "String",
                "isKey": false,
                "displayName": "Pick Up Location",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "destination",
                "type": "String",
                "isKey": false,
                "displayName": "Destination",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              },
              {
                "name": "status",
                "type": "String",
                "isKey": false,
                "displayName": "Status",
                "uiStyle": {
                  "inputUI": "TEXT",
                  "viewUI": "TEXT"
                }
              }
            ],
            "commands": [
              {
                "name": "CreateBookingCommand",
                "properties": [
                  {
                    "name": "passengerId",
                    "type": "Long"
                  },
                  {
                    "name": "driverId",
                    "type": "Long"
                  },
                  {
                    "name": "pickUpLocation",
                    "type": "String"
                  },
                  {
                    "name": "destination",
                    "type": "String"
                  }
                ],
                "api_verb": "POST",
                "api_uri": "/bookings",
                "actor": "Passenger",
                "outputEvents": [
                  "BookingCreated"
                ]
              },
              {
                "name": "AssignDriverCommand",
                "properties": [
                  {
                    "name": "bookingId",
                    "type": "Long"
                  },
                  {
                    "name": "driverId",
                    "type": "Long"
                  }
                ],
                "api_verb": "PUT",
                "api_uri": "/bookings/{bookingId}/assign-driver/{driverId}",
                "actor": "Driver",
                "outputEvents": [
                  "DriverAssignedToBooking"
                ]
              },
              {
                "name": "UpdateBookingStatusCommand",
                "properties": [
                  {
                    "name": "bookingId",
                    "type": "Long"
                  },
                  {
                    "name": "status",
                    "type": "String"
                  }
                ],
                "api_verb": "PUT",
                "api_uri": "/bookings/{bookingId}/update-status/{status}",
                "actor": "Driver",
                "outputEvents": [
                  "BookingStatusUpdated"
                ]
              }
            ],
            "events": [
              {
                "name": "BookingCreated",
                "properties": [
                  {
                    "name": "id",
                    "type": "Long"
                  }
                ]
              },
              {
                "name": "DriverAssignedToBooking",
                "properties": [
                  {
                    "name": "id",
                    "type": "Long"
                  },
                  {
                    "name": "driverId",
                    "type": "Long"
                  }
                ]
              },
              {
                "name": "BookingStatusUpdated",
                "properties": [
                  {
                    "name": "id",
                    "type": "Long"
                  },
                  {
                    "name": "status",
                    "type": "String"
                  }
                ]
              }
            ]
          }
        ]
      }
  }`);
  



  let aggregate = converted.elements["bc-passenger-management-agg-Passenger"]
  let enum = Object.values(aggregate.aggregateRoot.entities['elements'].find(ele => ele.name === "PhoneNumber"))
  expect(aggregate.uiStyle.icon).toBe("account_circle")
  expect(enum._type.endsWith("Enumeration")).toBe(true)
  
});