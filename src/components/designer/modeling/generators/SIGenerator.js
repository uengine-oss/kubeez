import JsonAIGenerator from "./JsonAIGenerator";


export default class SIGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }

    createPrompt(){
        if(this.client.errorLog){
            return `I modified the file as you said and ran an mvn test, but this error occurred.
            Error log: ${this.client.errorLog}
            Check the error log and modify the code so that the file with the error passes "mvn test".
            you must follow this json format:
            [
                {
                    solution: "Solution description",
                    solutionType: "IMPLEMENT" | "MODIFICATIONS" | "CORRECT" | ENSURE" | "RETRY",
                    codeChanges: [
                        {
                            fileName: "source code file name",
                            fileCode: "File code provided before modification, original file code", // It must be full code in the file. It start with "package ..."
                            modifiedFileCode: "The new file code that merged the modified content with the content in the file code.", // It must be full code in the file. It start with "package ..."
                            action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE"
                        }
                    ]
                }
            ]`
        } else {
            return `You are a developer. You need to modify the codes to finally pass ${this.client.testFile.name} as shown below:
            ${this.client.testFile.name}: 
            ${this.client.testFile.code}
            
            
            Various errors will occur during the process of modifying the code in the code list.
            Errors may occur due to 1. insufficient writing of business logic, or 2. logic errors.
            If the business logic has not been written, please present a solution that writes the logic in an aggregate file within the domain code.
            SELF CRITICISM:
            Understand business logic well: When implementing, write with as much understanding of the business purpose of the test as possible and understand the given/when/then of the test to see if you are writing business logic.
            Anti-corruption processing of input events: When implemented within the port method within the input value and aggregate, the type conversion and value conversion rules must be well written by looking at the example values within the test and converting them appropriately.
            Maintain the existing class interface (methods, parameters, fields) as much as possible.
            Properly rethrow errors when handling try~catch: There should be no implementation that eats any errors through try~catch. If you do not know exactly why an error occurred, it is impossible to correct it later.
            
            Results must always be returned in the corresponding json format:
            
            [ 
                {
                    solution: "Solution description", 
                    solutionType: "IMPLEMENT" | "CORRECT" | ENSURE"  | "RETRY" ,
                    codeChanges: [
                        { 
                            fileName: "source code file name", 
                            fileCode: "File code provided before modification, original file code", // It must be full code in the file.  It start with "package ..."
                            modifiedFileCode: "The new file code that merged the modified content with the content in the file code.", // It must be full code in the file. It start with "package ..."
                            action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE" 
                        } 
                    ] 
                } 
            ]
            
            First, write the business logic to pass this test.`
        }

    }
// return `너는 개발자야. 다음 제시되는 ${this.client.testFile.name} 를 최종 통과하기 위해서는 코드들을 수정해야해:
// ${this.client.testFile.name}: 
// ${this.client.testFile.code}


// 코드리스트중에 있는 코드를 수정하는 과정에서 여러가지 오류들이 발생할거야 
// 오류가 발생하는 원인은 1. 비즈니스 로직 작성이 덜 된 경우,  2. 로직의 오류가 발생한 경우가 있을 수 있어. 
// 만약 비즈니스 로직이 작성이 덜 된 경우라면, domain 코드 내의 Aggregate 인 파일 내에 해당 로직을 작성하는 solution 으로 제시를 해줘.
// SELF CRITICISM:  
// 비즈니스 로직을 잘 이해할것: 구현시에는 Test 의 비즈니스 목적을 최대한 이해하여 작성하고 비즈니스 로직을 작성하고 있는지 test 의 given/when/then 을 파악
// 입력 Event 의 Anti-corruption 처리: 입력되는 값과 어그리거트 내의 port method 내에서 구현될때 형변환 및 값 변환의 규칙을 test내의 example 값들을 보고 적절히 convert 하는 로직을 잘 작성해줘야 해.
// 기존의 클래스 인터페이스 (메서드, 파라미터, 필드) 를 최대한 유지할 것.
// try~catch 처리시 오류를 제대로 rethrow:  어떠한 오류를 try~catch를 통해서 먹어버리는 구현은 없어야 해. 정확히 어떠한 이유로 오류가 났는지를 모르면 이후 수정이 불가능해
 
// 결과는 항상 json format 으로 리턴해줘:

// [ 
//     {
//         solution: "Solution description", 
//         solutionType: “IMPLEMENT” | "CORRECT" | ENSURE"  | "RETRY" ,
//         codeChanges: [
//             { 
//                 fileName: "source code file name", 
//                 fileCode: "File code provided before modification, original file code", // // It must be full code in the file.  It start with "package ..."
//                 modifiedFileCode: "The new file code that merged the modified content with the content in the file code.", // It must be full code in the file. It start with "package ..."
//                 action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE" 
// 
                    // fileName: "source code file name", 
                    // methodName: “method name to be corrected or implemented”,
                    // oldCode: "The existing code that should be corrected. don't modify the code.", 
                    // lineNumber: the actual line number (written in the last comment of each lines),
                    // newCode: "New code", 
                    // action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE" 
//             } 
//         ] 
//     } 
// ]

// 먼저 이 테스트를 통과하기 위한 비즈니스 로직을 작성해줘.`



    createModel(text){
        // let model = super.createModel(text);
        // var me = this 
        return text;
    }

}
