const PptxGenJS = require("pptxgenjs");
const convert = require('convert-length');


const types = {
    // EventStorming
    BoundedContext: {
        fill: "ffffff",
        stroke: "000000",
        transparency: 100,
    },
    Event: {
        fill: "f1a746",
        stroke: "f1a746",
        transparency: 0,
    },
    Aggregate: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 50,
    },
    Command: {
        fill: "5099f7",
        stroke: "5099f7",
        transparency: 0,
    },
    Policy: {
        fill: "bb94bf",
        stroke: "bb94bf",
        transparency: 0,
    },
    View: {
        fill: "5fc08b",
        stroke: "5fc08b",
        transparency: 0,
    },
    Issue: {
        fill: "8e24aa",
        stroke: "8e24aa",
        transparency: 0,
    },
    External: {
        fill: "ed73b6",
        stroke: "ed73b6",
        transparency: 0,
    },
    Actor: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 0,
    },

    // Business Model
    BusinessModelPerspective: {
        fill: "ffffff",
        stroke: "000000",
        transparency: 100,
    },
    ValueProposition: {
        fill: "ff4da5",
        stroke: "ff4da5",
        transparency: 0,
    },
    CustomerSegment: {
        fill: "a2d471",
        stroke: "a2d471",
        transparency: 0,
    },
    channel: {
        fill: "f17171",
        stroke: "f17171",
        transparency: 0,
    },
    CustomerRelationship: {
        fill: "ffd071",
        stroke: "ffd071",
        transparency: 0,
    },
    KeyActivity: {
        fill: "71e2d0",
        stroke: "71e2d0",
        transparency: 0,
    },
    KeyResource: {
        fill: "7ea9ff",
        stroke: "7ea9ff",
        transparency: 0,
    },
    KeyPartner: {
        fill: "71d0ff",
        stroke: "71d0ff",
        transparency: 0,
    },
    RevenueStream: {
        fill: "838dff",
        stroke: "838dff",
        transparency: 0,
    },
    CostStructure: {
        fill: "ffad71",
        stroke: "ffad71",
        transparency: 0,
    },

    // Customer Journey Map
    Persona: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 0,
    },
    Phase: {
        fill: "8e24aa",
        stroke: "8e24aa",
        transparency: 0,
    },
    UserAction: {
        fill: "5099f7",
        stroke: "5099f7",
        transparency: 0,
    },
    TouchPoint: {
        fill: "5fc08b",
        stroke: "5fc08b",
        transparency: 0,
    },
    PainPoint: {
        fill: "f1a746",
        stroke: "f1a746",
        transparency: 0,
    },
    PossibleSolution: {
        fill: "ed73b6",
        stroke: "ed73b6",
        transparency: 0,
    },
};

// Business Model Canvas
const perspectives = [
    {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Partners",
        "perspective": "key-partner",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "e8f5cd23-616c-b911-5bcd-a5bd1243df24",
            "x": 300,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Activities",
        "perspective": "key-activity",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "d8deafd1-564b-19b7-1d0b-2ace2730f6cf",
            "x": 600,
            "y": 250,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Resources",
        "perspective": "key-resource",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "462bb51c-8efb-6657-3b04-6c754876be40",
            "x": 600,
            "y": 550,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Value Proposition",
        "perspective": "value-proposition",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "2fde0b06-3c34-d5c1-d43c-36a52718a205",
            "x": 900,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Customer Relationships",
        "perspective": "customer-relationship",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "ecdf7402-a80d-1474-ec23-9363a74698af",
            "x": 1200,
            "y": 250,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Channels",
        "perspective": "channel",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "d0183098-e987-3214-7f42-20dcf8a364c5",
            "x": 1200,
            "y": 550,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Customer Segments",
        "perspective": "customer-segment",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "84f0b913-207f-7229-cdb4-a536625138c2",
            "x": 1500,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Cost Structure",
        "perspective": "cost-structure",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "5b350418-d0aa-37de-7185-2ba8613bfa25",
            "x": 525,
            "y": 850,
            "width": 750,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Revenue Streams",
        "perspective": "revenue-stream",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "636ae7aa-186a-0a54-00cf-bf221578aab4",
            "x": 1275,
            "y": 850,
            "width": 750,
            "height": 300,
            "style": "{}"
        },
    }
];

class PowerPointGenerator {

    constructor(pptName) {
        this.pptName = pptName;
    }

    convertToShape(pptx, slide, modelData) {
        const me = this;

        if (modelData.value.hasOwnProperty("elements") && Object.values(modelData.value.elements).length > 0) {
            let elements = Object.values(modelData.value.elements);
            let list = [];

            if (modelData.canvasType === "bm") {
                elements = elements.concat(perspectives);
            }

            elements.forEach((item) => {
                if (item && item.elementView) {
                    if (item._type.includes("Text")) {
                        //
                    } else if (item._type.includes("Line")) {
                        //
                    }  else {
                        item.elementView.x = item.elementView.x - (item.elementView.width/2)
                        item.elementView.y = item.elementView.y - (item.elementView.height/2)
                        list = me.setShapeByType(pptx, item, list, modelData.canvasType);
                        
                    }
                }
            });

            const borders = list.filter((shape) => shape.type === "border");
            const shapes = list.filter((shape) => shape.type !== "border");
            list = borders.concat(shapes);

            list.forEach((shape) => {
                slide.addText(shape.textList, shape);
            })
        }
        return slide;
    }

    /**
     * TODO: relations Line 그룹화
     */
    convertToArrow(pptx, slide, modelData) {
        if (modelData.value.hasOwnProperty("relations") && Object.values(modelData.value.relations).length > 0) {
            const relations = Object.values(modelData.value.relations);
            relations.forEach((item) => {
                if (item && item.relationView) {
                    const vertices = JSON.parse(item.relationView.value);
                    const midIdx = Math.floor((vertices.length + 1)/2);
                    const lastIdx = vertices.length - 1;
                    if (vertices.length > 0) {
                        vertices.forEach((val, idx) => {
                            if (idx > 0) {
                                const preVal = vertices[idx-1];
                                const shape = {
                                    shape: pptx.shapes.LINE,
                                    x: convert(preVal[0], "px", "in"),
                                    y: convert(preVal[1], "px", "in"),
                                    line: {
                                        width: 1,
                                    },
                                    fontSize: 10,
                                    align: "center",
                                    valign: "top",
                                };

                                if (preVal[0] >= val[0]) {
                                    shape.x = convert(val[0], "px", "in");
                                    shape.w = convert(preVal[0] - val[0], "px", "in");
                                } else {
                                    shape.w = convert(val[0] - preVal[0], "px", "in");
                                }
                                if (preVal[1] >= val[1]) {
                                    shape.y = convert(val[1], "px", "in");
                                    shape.h = convert(preVal[1] - val[1], "px", "in");
                                } else {
                                    shape.h = convert(val[1] - preVal[1], "px", "in");
                                }

                                if (idx === lastIdx && (
                                        preVal[0] < val[0] || preVal[1] < val[1]
                                )) {
                                    shape.line.beginArrowType = "none";
                                    shape.line.endArrowType = "triangle";
                                } else if (idx === lastIdx && (
                                        preVal[0] >= val[0] || preVal[1] >= val[1]
                                )) {
                                    shape.line.beginArrowType = "triangle";
                                    shape.line.endArrowType = "none";
                                }
                                
                                if (modelData.canvasType === "es") {
                                    if (item.sourceElement.boundedContext && 
                                        item.sourceElement.boundedContext.id &&
                                        item.targetElement.boundedContext &&
                                        item.targetElement.boundedContext.id
                                    ) {
                                        if (item.sourceElement.boundedContext.id === item.targetElement.boundedContext.id) {
                                            shape.line.dashType = "dash"
                                        } else {
                                            shape.line.dashType = "solid"
                                        }
                                    } else {
                                        shape.line.dashType = "dash"
                                    }
                                }

                                if (idx === midIdx) {
                                    slide.addText(item.name, shape);
                                } else {
                                    slide.addShape(pptx.shapes.LINE, shape);
                                }
                                
                            }
                        })
                    }
                }
            });
        }

        return slide;
    }

    setShapeByType(pptx, object, list, canvasType) {
        const me = this;
        let type;
        if (object._type.includes(".")) {
            type = object._type.split(".").pop();
        } else {
            type = object._type;
        }
        console.log(type)
        let shape = {
            type: "shape",
            textList: [],
            shape: pptx.shapes.RECTANGLE,
            x: convert(object.elementView.x, "px", "in"),
            y: convert(object.elementView.y, "px", "in"),
            w: convert(object.elementView.width, "px", "in"),
            h: convert(object.elementView.height, "px", "in"),
            fill: {
                color: types[type].fill,
                transparency: types[type].transparency,
            },
            line: {
                color: types[type].stroke
            },
            valign: "top",
            autoFit: true
        };

        if (canvasType === "es") {
            shape = me.generateEventStorming(object, type, shape);
        } else if (canvasType === "bm") {
            shape = me.generateBusinessModel(object, type, shape);
        } else if (canvasType === "cjm") {
            shape = me.generateCustomerJourneyMap(object, type, shape);
        }

        list.push(shape)

        return list;
    }

    // EventStorming Canvas
    generateEventStorming(object, type, shape) {
        if (object._type.includes("Event") || 
                object._type.includes("Aggregate") || 
                object._type.includes("View")
        ) {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                },
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                    }
                }
            ];
            
            if (object.fieldDescriptors && object.fieldDescriptors.length > 1) {
                const lastIdx = object.fieldDescriptors.length-1
                object.fieldDescriptors.forEach((attr, idx) => {
                    let text = `● ${attr.name}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    shape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left"
                        }
                    })
                })
            } else if (object.aggregateRoot && 
                    object.aggregateRoot.fieldDescriptors && 
                    object.aggregateRoot.fieldDescriptors.length > 1
            ) {
                const lastIdx = object.aggregateRoot.fieldDescriptors.length-1
                object.aggregateRoot.fieldDescriptors.forEach((attr, idx) => {
                    let text = `● ${attr.name}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    shape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left"
                        }
                    })
                })
            } else {
                shape.valign = "middle"
            }

        } else if (object._type.includes("Actor")) {
            shape.textList = [
                {
                    text: object.name,
                    options: {
                        fontSize: 10,
                        align: "center",
                    }
                }
            ];

        } else if (object._type.includes("BoundedContext")) {
            shape.type = "border";
            shape.textList = [
                {
                    text: object.name,
                    options: {
                        fontSize: 10,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];

        } else {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }

        return shape;
    }

    // Business Model Canvas
    generateBusinessModel(object, type, shape) {
        if (object._type.includes("BusinessModelPerspective")) {
            shape.type = "border";
            shape.textList = [
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];

        } else {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }
        
        return shape;
    }

    // CustomerJourneyMap
    generateCustomerJourneyMap(object, type, shape) {
        if (object._type.includes("Persona")) {
            shape.textList = [
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                        valign: "middle"
                    }
                    
                }
            ];

        } else if (object._type.includes("Phase")) {
            shape.textList = [
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                        color: "ffffff"
                    }
                    
                }
            ];

        } else {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }

        return shape;
    }

    createPowerPoint(modelData) {
        const me = this;
        const pptGen = PptxGenJS.default;
        let pptx;

        if (pptGen) {
            pptx = new pptGen();
        } else {
            pptx = new PptxGenJS();
        }

        pptx.defineLayout({ name:'canvas', width: 20, height: 12 });
        pptx.layout = 'canvas';

        modelData.forEach((model) => {
            let slide = pptx.addSlide();
            slide = me.convertToShape(pptx, slide, model);
            slide = me.convertToArrow(pptx, slide, model);
    
        })
        
        pptx.writeFile({ fileName: me.pptName });
    }
}

module.exports = PowerPointGenerator;