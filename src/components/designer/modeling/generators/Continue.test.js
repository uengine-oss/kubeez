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

test('continue', () => {

  let client = new Client();
  let generator = new ESGenerator(client);
  generator.createMessages();
  generator.previousMessages.push({
    role: "assistant",
    content: `{
      "serviceName": "Taxi Service",
      "actors": ["Driver", "Passenger"],
      "boundedContext": {
          "taxi-call": {
              "aggregates": [
                  {
                      "name": "TaxiCall",
                      "entities": [
                          {
                              "name": "Request",
                              "isAggregateRoot": true,
                              "properties": [
                                  {
                                      "name": "id",
                                      "type": "String",
                                      "isKey": true,
                                      "displayName": "ID"
                                  },
                                  {
                                      "name": "passengerId",
                                      "type": "String",
                                      "displayName": "Passenger ID"
                                  },
                                  {
                                      "name": "pickupLocation",
                                      "type": "String",
                                      "displayName": "Pickup Location"
                                  },
                                  {
                                      "name": "destination",
                                      "type": "String",
                                      "displayName": "Destination"
                                  },
                                  {
                                      "name": "discountCoupon",
                                      "type": "String",
                                      "displayName": "Discount Coupon",
                                      "inputUI": "TEXT",
                                      "viewUI": "TEXT"
                                  }
                              ],
                              "commands": [
                                  {
                                      "name": "CreateRequest",
                                      "properties": [
                                          {
                                              "name": "passengerId",
                                              "type": "String"
                                          },
                                          {
                                              "name": "pickupLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "destination",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "POST",
                                      "api_uri": "/requests",
                                      "actor": "Passenger",
                                      "outputEvents": ["RequestCreated"]
                                  },
                                  {
                                      "name": "UpdateRequest",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "pickupLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "destination",
                                              "type": "String"
                                          },
                                          {
                                              "name": "discountCoupon",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/requests/:id",
                                      "actor": "Passenger",
                                      "outputEvents": ["RequestUpdated"]
                                  },
                                  {
                                      "name": "DeleteRequest",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "DELETE",
                                      "api_uri": "/requests/:id",
                                      "actor": "Passenger",
                                      "outputEvents": ["RequestDeleted"]
                                  },
                                  {
                                      "name": "AssignDriver",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverId",
                                              "type": "String"
                                          },
                                          {
                                              "name": "expectedDuration",
                                              "type": "String"
                                          },
                                          {
                                              "name": "expectedFare",
                                              "type": "Float"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/requests/:id/assign",
                                      "actor": "Driver",
                                      "outputEvents": ["DriverAssigned"]
                                  },
                                  {
                                      "name": "PickUpPassenger",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverLocation",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/requests/:id/pickup",
                                      "actor": "Driver",
                                      "outputEvents": ["PassengerPickedUp"]
                                  },
                                  {
                                      "name": "DropOffPassenger",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "fare",
                                              "type": "Float"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/requests/:id/dropoff",
                                      "actor": "Driver",
                                      "outputEvents": ["PassengerDroppedOff"]
                                  }
                              ],
                              "events": [
                                  {
                                      "name": "RequestCreated",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "passengerId",
                                              "type": "String"
                                          },
                                          {
                                              "name": "pickupLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "destination",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "RequestUpdated",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "pickupLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "destination",
                                              "type": "String"
                                          },
                                          {
                                              "name": "discountCoupon",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "RequestDeleted",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "DriverAssigned",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverId",
                                              "type": "String"
                                          },
                                          {
                                              "name": "expectedDuration",
                                              "type": "String"
                                          },
                                          {
                                              "name": "expectedFare",
                                              "type": "Float"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "PassengerPickedUp",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverLocation",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "PassengerDroppedOff",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "driverLocation",
                                              "type": "String"
                                          },
                                          {
                                              "name": "fare",
                                              "type": "Float"
                                          }
                                      ]
                                  }
                              ],
                              "relations": [
                                  {
                                      "sourceEntity": "Request",
                                      "targetEntity": "Driver",
                                      "type": "ManyToOne"
                                  },
                                  {
                                      "sourceEntity": "Request",
                                      "targetEntity": "Passenger",
                                      "type": "ManyToOne"
                                  }
                              ]
                          }
                      ]
                  },
                  {
                      "name": "DriverProfiling",
                      "entities": [
                          {
                              "name": "Driver",
                              "isAggregateRoot": true,
                              "properties": [
                                  {
                                      "name": "id",
                                      "type": "String",
                                      "isKey": true,
                                      "displayName": "ID"
                                  },
                                  {
                                      "name": "isAvailable",
                                      "type": "Boolean",
                                      "displayName": "is Available"
                                  },
                                  {
                                      "name": "name",
                                      "type": "String",
                                      "displayName": "Name"
                                  },
                                  {
                                      "name": "phoneNumber",
                                      "type": "String",
                                      "displayName": "Phone Number"
                                  },
                                  {
                                      "name": "vehicleType",
                                      "type": "String",
                                      "displayName": "Vehicle Type",
                                      "inputUI": "SELECT",
                                      "options": ["Sedan", "SUV", "Truck", "Van"],
                                      "viewUI": "TEXT"
                                  },
                                  {
                                      "name": "location",
                                      "type": "String",
                                      "displayName": "Location",
                                      "inputUI": "TEXT",
                                      "viewUI": "TEXT"
                                  }
                              ],
                              "commands": [
                                  {
                                      "name": "CreateDriver",
                                      "properties": [
                                          {
                                              "name": "name",
                                              "type": "String"
                                          },
                                          {
                                              "name": "phoneNumber",
                                              "type": "String"
                                          },
                                          {
                                              "name": "vehicleType",
                                              "type": "String"
                                          },
                                          {
                                              "name": "location",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "POST",
                                      "api_uri": "/drivers",
                                      "actor": "Driver",
                                      "outputEvents": ["DriverCreated"]
                                  },
                                  {
                                      "name": "UpdateDriverProfile",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "isAvailable",
                                              "type": "Boolean"
                                          },
                                          {
                                              "name": "name",
                                              "type": "String"
                                          },
                                          {
                                              "name": "phoneNumber",
                                              "type": "String"
                                          },
                                          {
                                              "name": "vehicleType",
                                              "type": "String"
                                          },
                                          {
                                              "name": "location",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/drivers/:id",
                                      "actor": "Driver",
                                      "outputEvents": ["DriverProfileUpdated"]
                                  },
                                  {
                                      "name": "DeleteDriver",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "DELETE",
                                      "api_uri": "/drivers/:id",
                                      "actor": "Driver",
                                      "outputEvents": ["DriverDeleted"]
                                  }
                              ],
                              "events": [
                                  {
                                      "name": "DriverCreated",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "name",
                                              "type": "String"
                                          },
                                          {
                                              "name": "phoneNumber",
                                              "type": "String"
                                          },
                                          {
                                              "name": "vehicleType",
                                              "type": "String"
                                          },
                                          {
                                              "name": "location",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "DriverProfileUpdated",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "isAvailable",
                                              "type": "Boolean"
                                          },
                                          {
                                              "name": "name",
                                              "type": "String"
                                          },
                                          {
                                              "name": "phoneNumber",
                                              "type": "String"
                                          },
                                          {
                                              "name": "vehicleType",
                                              "type": "String"
                                          },
                                          {
                                              "name": "location",
                                              "type": "String"
                                          }
                                      ]
                                  },
                                  {
                                      "name": "DriverDeleted",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          }
                                      ]
                                  }
                              ],
                              "relations": [
                                  {
                                      "sourceEntity": "Driver",
                                      "targetEntity": "Request",
                                      "type": "OneToMany"
                                  }
                              ]
                          }
                      ]
                  }
              ]
          },
          "payment": {
              "aggregates": [
                  {
                      "name": "Billing",
                      "entities": [
                          {
                              "name": "Fare",
                              "isAggregateRoot": true,
                              "properties": [
                                  {
                                      "name": "id",
                                      "type": "String",
                                      "isKey": true,
                                      "displayName": "ID"
                                  },
                                  {
                                      "name": "requestId",
                                      "type": "String",
                                      "displayName": "Request ID"
                                  },
                                  {
                                      "name": "fare",
                                      "type": "Float",
                                      "displayName": "Fare"
                                  },
                                  {
                                      "name": "paymentMethod",
                                      "type": "String",
                                      "displayName": "Payment Method",
                                      "inputUI": "SELECT",
                                      "options": ["Credit Card", "Debit Card", "Cash"],
                                      "viewUI": "TEXT"
                                  },
                                  {
                                      "name": "status",
                                      "type": "String",
                                      "displayName": "Status"
                                  }
                              ],
                              "commands": [
                                  {
                                      "name": "CreateFare",
                                      "properties": [
                                          {
                                              "name": "requestId",
                                              "type": "String"
                                          },
                                          {
                                              "name": "fare",
                                              "type": "Float"
                                          },
                                          {
                                              "name": "paymentMethod",
                                              "type": "String"
                                          },
                                          {
                                              "name": "status",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "POST",
                                      "api_uri": "/fares",
                                      "actor": "Driver",
                                      "outputEvents": ["FareCreated"]
                                  },
                                  {
                                      "name": "UpdateFare",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          },
                                          {
                                              "name": "status",
                                              "type": "String"
                                          }
                                      ],
                                      "api_verb": "PUT",
                                      "api_uri": "/fares/:id",
                                      "actor": "Passenger",
                                      "outputEvents": ["FareUpdated"]
                                  }
                              ],
                              "events": [
                                  {
                                      "name": "FareCreated",
                                      "properties": [
                                          {
                                              "name": "id",
                                              "type": "String"
                                          }
                                    ]
`
  })

//   generator.continue();

//   expect(generator.previousMessages.length).toBe(3);
//   expect(generator.previousMessages[generator.previousMessages.length-1].content).toBe("continue");

});