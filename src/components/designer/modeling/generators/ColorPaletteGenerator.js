import JsonAIGenerator from "./JsonAIGenerator";


export default class ColorPaletteGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }
    
    createPrompt(){
        return `
        Please recommend 3 color palette set that contains 10 colors for the service:  

        ${this.client.input.title}

        The result should in this JSON format:

        [{
          "paletteName": "title of palette",
          "colors":{
            "background": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "surface": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "mainText": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "secondaryText": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "primary": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "primary-darken-1": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "secondary": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "secondary-darken-1": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "error": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "info": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "success": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            },
            "warning": {
                "colorCode": "Color hexa code", // ex) #0072CE",
                "colorName": "Name of color", // Royal Blue
                "description": "Why the color is recommended"
            }           
           }
        ]
`
    }

    
}