const AggregateMemberGenerator = require('./AggregateMemberGenerator.js');

global.window = {}

const modelJson = '{"elements":{"d4ee9401-33e2-51f6-e42b-6416cfa23ae2":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","name":"Customer","namePascalCase":"Customer","nameCamelCase":"customer","namePlural":"Customers","fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"name","displayName":"이름","nameCamelCase":"name","namePascalCase":"Name","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Email","isCopy":false,"isKey":false,"name":"email","displayName":"이메일","nameCamelCase":"email","namePascalCase":"Email","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT","isVO":true,"classId":"83460572-c4f5-f757-b842-7575b3fe8ded","isList":false,"label":"- email: Email"},{"_type":"org.uengine.model.FieldDescriptor","name":"test","namePascalCase":"Test","nameCamelCase":"test","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"address","className":"Address","isKey":false,"isVO":true,"namePascalCase":"Address","nameCamelCase":"address","label":"- address: Address","classId":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","isList":false}],"operations":[{"name":"UpdateCustomer","class":"Customer","returnType":"void","parameters":[],"label":"+ UpdateCustomer(): void","isOverride":false,"isRootMethod":true}],"elementView":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","x":300,"y":250,"width":200,"height":276,"style":"{}","titleH":50,"subEdgeH":241,"fieldH":226,"methodH":35},"selected":false,"relations":["e036f173-17f0-d24c-6997-702db0cb3f52","997f3dfe-1e4a-96d3-ce81-feb5f757099f","323e2cd5-c3be-80b7-1829-f6de2b9c4ebf","eb4de1dd-a7d1-9e98-aa00-b789ec780c14","bda406e8-b251-6817-0ebc-c42727a5e640","f32e2a7a-7227-8da9-03d7-99a569edbc8f","7cf09d3f-4f1a-cf3f-0e54-836c9b9940cf","2ab0d78e-c976-f524-9301-725342d3d7a2","1fe75e4a-8860-9510-75ff-2534a1b6aea7","15dc6b6a-0236-6a0d-ee7a-db44b3a868dc","b8f29d92-e9ec-e9f1-08a6-3c0f571b545d","663882ff-73c0-b929-fb67-26b836ac4106","28647c87-f745-9845-52e3-b51289cc9b4f","70c31d60-aa69-7043-0cc7-525e086bed2b","c6ab4c54-07ae-c0ae-470a-1179ac1c735b","42fd7c4d-f2c0-cdeb-5532-2774a1aeb10e","9e883a35-14e8-cd0b-e766-237e3ee358d0","f9c02fe8-42cf-a5e9-e8d9-3063299e3f5e","75473c5f-f101-f39b-ad9e-e21dd266b693","bc875644-2eec-d92c-09f1-7ef0a0e059d9","bf5c6524-762d-38a9-8b64-46892a85648b","633b65d0-1ccd-6859-05e5-7d1b92b64ee0","f1479060-e01c-693f-b4a9-8edd55d4cfe5","e5df6af9-0beb-ed7e-00eb-541b5ade33f2","ecb4b3a4-0a2a-d9bf-3807-71973b2f5f70","81300246-0aed-f2b2-0646-6da07f9fd1cb","3313ad3f-4812-2d79-db6f-650397cf7e6e","9c969ced-c745-a062-540c-49addb5f3235","85485c8e-7443-5001-4b6f-8a9790822cbc","6a12770d-1a30-cbb3-0558-e8214b68c2d3","400bed7e-fd94-b2f7-11a7-8be324547460","ffc2c751-0862-670e-6b59-c9457a8da643","c47beb99-2fc4-2e26-1c66-bbd4c6ace4ce","f466a710-f1b3-6168-fcdd-4f983c58f39b","5c4dcd63-b0e7-2e34-76df-085777dedc0d","d97e8949-5bd6-198c-9174-09228170c899","0152baf4-1ef4-3782-a537-e719c6b26252","cba3ab1c-2185-db6f-c2c0-ae1731275a36"],"parentOperations":[],"relationType":null,"isVO":false,"isAbstract":false,"isInterface":false,"isAggregateRoot":true,"parentId":"36e35b35-08b4-850c-2c30-cf65402d5426-agg-Customer"},"22a177c1-f8cb-6033-5b84-bf9f40e7daf2":{"_type":"org.uengine.uml.model.vo.Class","elementView":{"_type":"org.uengine.uml.model.vo.Class","id":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","style":"{}","fieldH":50,"height":100,"methodH":30,"subEdgeH":70,"titleH":30,"width":200,"x":700,"y":491},"fieldDescriptors":[{"_type":"org.uengine.model.FieldDescriptor","name":"city","namePascalCase":"City","nameCamelCase":"city","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"state","namePascalCase":"State","nameCamelCase":"state","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"country","namePascalCase":"Country","nameCamelCase":"country","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false}],"isAbstract":false,"isAggregateRoot":false,"isInterface":false,"isVO":true,"name":"Address","nameCamelCase":"address","namePascalCase":"Address","namePlural":"Addresses","operations":[],"parentOperations":[],"relationType":null,"relations":["997f3dfe-1e4a-96d3-ce81-feb5f757099f","bda406e8-b251-6817-0ebc-c42727a5e640","15dc6b6a-0236-6a0d-ee7a-db44b3a868dc","c6ab4c54-07ae-c0ae-470a-1179ac1c735b","f9c02fe8-42cf-a5e9-e8d9-3063299e3f5e","633b65d0-1ccd-6859-05e5-7d1b92b64ee0","81300246-0aed-f2b2-0646-6da07f9fd1cb","6a12770d-1a30-cbb3-0558-e8214b68c2d3","f466a710-f1b3-6168-fcdd-4f983c58f39b","cba3ab1c-2185-db6f-c2c0-ae1731275a36"],"selected":false},"83460572-c4f5-f757-b842-7575b3fe8ded":{"_type":"org.uengine.uml.model.vo.Class","elementView":{"_type":"org.uengine.uml.model.vo.Class","id":"83460572-c4f5-f757-b842-7575b3fe8ded","style":"{}","fieldH":50,"height":100,"methodH":30,"subEdgeH":70,"titleH":30,"width":200,"x":300,"y":491},"fieldDescriptors":[{"displayName":null,"className":null,"isKey":false,"isList":false,"isLob":false,"isName":false,"isVO":false,"name":"emailAddress","nameCamelCase":"emailAddress","namePascalCase":"emailAddress","_type":"org.uengine.model.FieldDescriptor"}],"groupElement":null,"isAbstract":false,"isAggregateRoot":false,"isInterface":false,"isVO":true,"name":"Email","nameCamelCase":"Email","namePascalCase":"Email","namePlural":"Email","operations":[],"parentOperations":[],"relationType":null,"relations":["323e2cd5-c3be-80b7-1829-f6de2b9c4ebf","eb4de1dd-a7d1-9e98-aa00-b789ec780c14","7cf09d3f-4f1a-cf3f-0e54-836c9b9940cf","2ab0d78e-c976-f524-9301-725342d3d7a2","1fe75e4a-8860-9510-75ff-2534a1b6aea7","663882ff-73c0-b929-fb67-26b836ac4106","28647c87-f745-9845-52e3-b51289cc9b4f","70c31d60-aa69-7043-0cc7-525e086bed2b","9e883a35-14e8-cd0b-e766-237e3ee358d0","bf5c6524-762d-38a9-8b64-46892a85648b","f1479060-e01c-693f-b4a9-8edd55d4cfe5","e5df6af9-0beb-ed7e-00eb-541b5ade33f2","ecb4b3a4-0a2a-d9bf-3807-71973b2f5f70","3313ad3f-4812-2d79-db6f-650397cf7e6e","9c969ced-c745-a062-540c-49addb5f3235","85485c8e-7443-5001-4b6f-8a9790822cbc","400bed7e-fd94-b2f7-11a7-8be324547460","ffc2c751-0862-670e-6b59-c9457a8da643","c47beb99-2fc4-2e26-1c66-bbd4c6ace4ce","5c4dcd63-b0e7-2e34-76df-085777dedc0d","d97e8949-5bd6-198c-9174-09228170c899","0152baf4-1ef4-3782-a537-e719c6b26252"],"selected":false}},"relations":{"0152baf4-1ef4-3782-a537-e719c6b26252":{"from":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","to":"83460572-c4f5-f757-b842-7575b3fe8ded","_type":"org.uengine.uml.model.Relation","fromLabel":"","name":"Email","relationType":"Association","relationView":{"id":"0152baf4-1ef4-3782-a537-e719c6b26252","from":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","to":"83460572-c4f5-f757-b842-7575b3fe8ded","value":"[[300,252],[300,441]]"},"selected":false,"sourceElement":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","name":"Customer","namePascalCase":"Customer","nameCamelCase":"customer","namePlural":"Customers","fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"name","displayName":"이름","nameCamelCase":"name","namePascalCase":"Name","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Email","isCopy":false,"isKey":false,"name":"email","displayName":"이메일","nameCamelCase":"email","namePascalCase":"Email","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT","isVO":true,"classId":"83460572-c4f5-f757-b842-7575b3fe8ded","isList":false,"label":"- email: Email"},{"_type":"org.uengine.model.FieldDescriptor","name":"test","namePascalCase":"Test","nameCamelCase":"test","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"address","className":"Address","isKey":false,"isVO":true,"namePascalCase":"Address","nameCamelCase":"address","label":"- address: Address","classId":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","isList":false}],"operations":[{"name":"UpdateCustomer","class":"Customer","returnType":"void","parameters":[],"label":"+ UpdateCustomer(): void","isOverride":false,"isRootMethod":true}],"elementView":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","x":300,"y":250,"width":200,"height":276,"style":"{}","titleH":50,"subEdgeH":241,"fieldH":226,"methodH":35},"selected":false,"relations":["e036f173-17f0-d24c-6997-702db0cb3f52","997f3dfe-1e4a-96d3-ce81-feb5f757099f","323e2cd5-c3be-80b7-1829-f6de2b9c4ebf","eb4de1dd-a7d1-9e98-aa00-b789ec780c14","bda406e8-b251-6817-0ebc-c42727a5e640","f32e2a7a-7227-8da9-03d7-99a569edbc8f","7cf09d3f-4f1a-cf3f-0e54-836c9b9940cf","2ab0d78e-c976-f524-9301-725342d3d7a2","1fe75e4a-8860-9510-75ff-2534a1b6aea7","15dc6b6a-0236-6a0d-ee7a-db44b3a868dc","b8f29d92-e9ec-e9f1-08a6-3c0f571b545d","663882ff-73c0-b929-fb67-26b836ac4106","28647c87-f745-9845-52e3-b51289cc9b4f","70c31d60-aa69-7043-0cc7-525e086bed2b","c6ab4c54-07ae-c0ae-470a-1179ac1c735b","42fd7c4d-f2c0-cdeb-5532-2774a1aeb10e","9e883a35-14e8-cd0b-e766-237e3ee358d0","f9c02fe8-42cf-a5e9-e8d9-3063299e3f5e","75473c5f-f101-f39b-ad9e-e21dd266b693","bc875644-2eec-d92c-09f1-7ef0a0e059d9","bf5c6524-762d-38a9-8b64-46892a85648b","633b65d0-1ccd-6859-05e5-7d1b92b64ee0","f1479060-e01c-693f-b4a9-8edd55d4cfe5","e5df6af9-0beb-ed7e-00eb-541b5ade33f2","ecb4b3a4-0a2a-d9bf-3807-71973b2f5f70","81300246-0aed-f2b2-0646-6da07f9fd1cb","3313ad3f-4812-2d79-db6f-650397cf7e6e","9c969ced-c745-a062-540c-49addb5f3235","85485c8e-7443-5001-4b6f-8a9790822cbc","6a12770d-1a30-cbb3-0558-e8214b68c2d3","400bed7e-fd94-b2f7-11a7-8be324547460","ffc2c751-0862-670e-6b59-c9457a8da643","c47beb99-2fc4-2e26-1c66-bbd4c6ace4ce","f466a710-f1b3-6168-fcdd-4f983c58f39b","5c4dcd63-b0e7-2e34-76df-085777dedc0d","d97e8949-5bd6-198c-9174-09228170c899","0152baf4-1ef4-3782-a537-e719c6b26252","cba3ab1c-2185-db6f-c2c0-ae1731275a36"],"parentOperations":[],"relationType":null,"isVO":false,"isAbstract":false,"isInterface":false,"isAggregateRoot":true,"parentId":"36e35b35-08b4-850c-2c30-cf65402d5426-agg-Customer"},"sourceMultiplicity":"1","targetElement":{"_type":"org.uengine.uml.model.vo.Class","elementView":{"_type":"org.uengine.uml.model.vo.Class","id":"83460572-c4f5-f757-b842-7575b3fe8ded","style":"{}","fieldH":50,"height":100,"methodH":30,"subEdgeH":70,"titleH":30,"width":200,"x":300,"y":491},"fieldDescriptors":[{"displayName":null,"className":null,"isKey":false,"isList":false,"isLob":false,"isName":false,"isVO":false,"name":"emailAddress","nameCamelCase":"emailAddress","namePascalCase":"emailAddress","_type":"org.uengine.model.FieldDescriptor"}],"groupElement":null,"isAbstract":false,"isAggregateRoot":false,"isInterface":false,"isVO":true,"name":"Email","nameCamelCase":"Email","namePascalCase":"Email","namePlural":"Email","operations":[],"parentOperations":[],"relationType":null,"relations":["323e2cd5-c3be-80b7-1829-f6de2b9c4ebf","eb4de1dd-a7d1-9e98-aa00-b789ec780c14","7cf09d3f-4f1a-cf3f-0e54-836c9b9940cf","2ab0d78e-c976-f524-9301-725342d3d7a2","1fe75e4a-8860-9510-75ff-2534a1b6aea7","663882ff-73c0-b929-fb67-26b836ac4106","28647c87-f745-9845-52e3-b51289cc9b4f","70c31d60-aa69-7043-0cc7-525e086bed2b","9e883a35-14e8-cd0b-e766-237e3ee358d0","bf5c6524-762d-38a9-8b64-46892a85648b","f1479060-e01c-693f-b4a9-8edd55d4cfe5","e5df6af9-0beb-ed7e-00eb-541b5ade33f2","ecb4b3a4-0a2a-d9bf-3807-71973b2f5f70","3313ad3f-4812-2d79-db6f-650397cf7e6e","9c969ced-c745-a062-540c-49addb5f3235","85485c8e-7443-5001-4b6f-8a9790822cbc","400bed7e-fd94-b2f7-11a7-8be324547460","ffc2c751-0862-670e-6b59-c9457a8da643","c47beb99-2fc4-2e26-1c66-bbd4c6ace4ce","5c4dcd63-b0e7-2e34-76df-085777dedc0d","d97e8949-5bd6-198c-9174-09228170c899","0152baf4-1ef4-3782-a537-e719c6b26252"],"selected":false},"targetMultiplicity":"1","toLabel":""},"cba3ab1c-2185-db6f-c2c0-ae1731275a36":{"from":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","to":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","_type":"org.uengine.uml.model.Relation","fromLabel":"","name":"address","relationType":"Association","relationView":{"id":"cba3ab1c-2185-db6f-c2c0-ae1731275a36","from":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","to":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","value":"[[400,252],[500,252],[500,492],[600,492]]"},"selected":false,"sourceElement":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","name":"Customer","namePascalCase":"Customer","nameCamelCase":"customer","namePlural":"Customers","fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"name","displayName":"이름","nameCamelCase":"name","namePascalCase":"Name","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Email","isCopy":false,"isKey":false,"name":"email","displayName":"이메일","nameCamelCase":"email","namePascalCase":"Email","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT","isVO":true,"classId":"83460572-c4f5-f757-b842-7575b3fe8ded","isList":false,"label":"- email: Email"},{"_type":"org.uengine.model.FieldDescriptor","name":"test","namePascalCase":"Test","nameCamelCase":"test","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"address","className":"Address","isKey":false,"isVO":true,"namePascalCase":"Address","nameCamelCase":"address","label":"- address: Address","classId":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","isList":false}],"operations":[{"name":"UpdateCustomer","class":"Customer","returnType":"void","parameters":[],"label":"+ UpdateCustomer(): void","isOverride":false,"isRootMethod":true}],"elementView":{"_type":"org.uengine.uml.model.Class","id":"d4ee9401-33e2-51f6-e42b-6416cfa23ae2","x":300,"y":250,"width":200,"height":276,"style":"{}","titleH":50,"subEdgeH":241,"fieldH":226,"methodH":35},"selected":false,"relations":["e036f173-17f0-d24c-6997-702db0cb3f52","997f3dfe-1e4a-96d3-ce81-feb5f757099f","323e2cd5-c3be-80b7-1829-f6de2b9c4ebf","eb4de1dd-a7d1-9e98-aa00-b789ec780c14","bda406e8-b251-6817-0ebc-c42727a5e640","f32e2a7a-7227-8da9-03d7-99a569edbc8f","7cf09d3f-4f1a-cf3f-0e54-836c9b9940cf","2ab0d78e-c976-f524-9301-725342d3d7a2","1fe75e4a-8860-9510-75ff-2534a1b6aea7","15dc6b6a-0236-6a0d-ee7a-db44b3a868dc","b8f29d92-e9ec-e9f1-08a6-3c0f571b545d","663882ff-73c0-b929-fb67-26b836ac4106","28647c87-f745-9845-52e3-b51289cc9b4f","70c31d60-aa69-7043-0cc7-525e086bed2b","c6ab4c54-07ae-c0ae-470a-1179ac1c735b","42fd7c4d-f2c0-cdeb-5532-2774a1aeb10e","9e883a35-14e8-cd0b-e766-237e3ee358d0","f9c02fe8-42cf-a5e9-e8d9-3063299e3f5e","75473c5f-f101-f39b-ad9e-e21dd266b693","bc875644-2eec-d92c-09f1-7ef0a0e059d9","bf5c6524-762d-38a9-8b64-46892a85648b","633b65d0-1ccd-6859-05e5-7d1b92b64ee0","f1479060-e01c-693f-b4a9-8edd55d4cfe5","e5df6af9-0beb-ed7e-00eb-541b5ade33f2","ecb4b3a4-0a2a-d9bf-3807-71973b2f5f70","81300246-0aed-f2b2-0646-6da07f9fd1cb","3313ad3f-4812-2d79-db6f-650397cf7e6e","9c969ced-c745-a062-540c-49addb5f3235","85485c8e-7443-5001-4b6f-8a9790822cbc","6a12770d-1a30-cbb3-0558-e8214b68c2d3","400bed7e-fd94-b2f7-11a7-8be324547460","ffc2c751-0862-670e-6b59-c9457a8da643","c47beb99-2fc4-2e26-1c66-bbd4c6ace4ce","f466a710-f1b3-6168-fcdd-4f983c58f39b","5c4dcd63-b0e7-2e34-76df-085777dedc0d","d97e8949-5bd6-198c-9174-09228170c899","0152baf4-1ef4-3782-a537-e719c6b26252","cba3ab1c-2185-db6f-c2c0-ae1731275a36"],"parentOperations":[],"relationType":null,"isVO":false,"isAbstract":false,"isInterface":false,"isAggregateRoot":true,"parentId":"36e35b35-08b4-850c-2c30-cf65402d5426-agg-Customer"},"sourceMultiplicity":"1","targetElement":{"_type":"org.uengine.uml.model.vo.Class","elementView":{"_type":"org.uengine.uml.model.vo.Class","id":"22a177c1-f8cb-6033-5b84-bf9f40e7daf2","style":"{}","fieldH":50,"height":100,"methodH":30,"subEdgeH":70,"titleH":30,"width":200,"x":700,"y":491},"fieldDescriptors":[{"_type":"org.uengine.model.FieldDescriptor","name":"city","namePascalCase":"City","nameCamelCase":"city","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"state","namePascalCase":"State","nameCamelCase":"state","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false},{"_type":"org.uengine.model.FieldDescriptor","name":"country","namePascalCase":"Country","nameCamelCase":"country","className":"String","isKey":false,"isName":false,"isList":false,"isVO":false,"isLob":false,"isCorrelationKey":false}],"isAbstract":false,"isAggregateRoot":false,"isInterface":false,"isVO":true,"name":"Address","nameCamelCase":"address","namePascalCase":"Address","namePlural":"Addresses","operations":[],"parentOperations":[],"relationType":null,"relations":["997f3dfe-1e4a-96d3-ce81-feb5f757099f","bda406e8-b251-6817-0ebc-c42727a5e640","15dc6b6a-0236-6a0d-ee7a-db44b3a868dc","c6ab4c54-07ae-c0ae-470a-1179ac1c735b","f9c02fe8-42cf-a5e9-e8d9-3063299e3f5e","633b65d0-1ccd-6859-05e5-7d1b92b64ee0","81300246-0aed-f2b2-0646-6da07f9fd1cb","6a12770d-1a30-cbb3-0558-e8214b68c2d3","f466a710-f1b3-6168-fcdd-4f983c58f39b","cba3ab1c-2185-db6f-c2c0-ae1731275a36"],"selected":false},"targetMultiplicity":"1","toLabel":""}}}'
const umlModel = {
    "classes": [
        {
            "name": "Customer",
            "displayName": "고객",
            "classType": "Entity",
            "isAggregateRoot": true,
            "properties": [
                {
                    "name": "name",
                    "type": "String",
                    "isKey": false,
                    "displayName": "이름",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "email",
                    "type": "Email",
                    "isKey": false,
                    "displayName": "이메일",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "test",
                    "type": "String",
                    "isKey": false,
                    "displayName": "테스트",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "address",
                    "type": "Address",
                    "isKey": false,
                    "displayName": "주소",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "phoneNumber",
                    "type": "String",
                    "isKey": false,
                    "displayName": "전화번호",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                }
            ]
        },
        {
            "name": "Email",
            "displayName": "이메일",
            "classType": "Value Object",
            "isAggregateRoot": false,
            "properties": [
                {
                    "name": "value",
                    "type": "String",
                    "isKey": false,
                    "displayName": "값",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                }
            ]
        },
        {
            "name": "Address",
            "displayName": "주소",
            "classType": "Value Object",
            "isAggregateRoot": false,
            "properties": [
                {
                    "name": "street",
                    "type": "String",
                    "isKey": false,
                    "displayName": "거리",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "city",
                    "type": "String",
                    "isKey": false,
                    "displayName": "도시",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                },
                {
                    "name": "country",
                    "type": "String",
                    "isKey": false,
                    "displayName": "국가",
                    "uiStyle": {
                        "inputUI": "TEXT",
                        "viewUI": "TEXT"
                    }
                }
            ]
        }
    ],
    "relations": [
        {
            "sourceEntity": "Customer",
            "targetEntity": "Email",
            "multiplicity": "OneToOne",
            "type": "Association"
        },
        {
            "sourceEntity": "Customer",
            "targetEntity": "Address",
            "multiplicity": "OneToOne",
            "type": "Association"
        }
    ]
}



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
  let generator = new AggregateMemberGenerator(client);

  let ui = {
    seq: 0,
    uuid(){
        return this.seq ++
    },

    value: JSON.parse(modelJson)

  }
  
  let converted = generator.additiveApply(ui, umlModel);
  
let aggregate = Object.values(converted.elements).find(ele => ele.name === "Customer")
let additiveField = aggregate.aggregateRoot.fieldDescriptors.find(fd => fd.name == "phoneNumber")
expect(additiveField).toBeTruthy()

});