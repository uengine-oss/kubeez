const { AceBaseServer } = require("acebase-server");
const { AceBaseClient } = require("acebase-client");
const express = require("express");
const app = express();
const _ = require("lodash");
const host = process.env.DB_HOST;
const dbname = "mydb";
const server = new AceBaseServer(dbname, {
    host: "localhost",
    port: 5757,
    // storage: {
    //     path: "/acebase"
    // },
    authentication: {
        enabled: true,
        allowUserSignup: true,
        defaultAccessRule: "auth",
        defaultAdminPassword: "75sdDSFg37w5",
    },
});
// const server = new AceBaseServer(dbname, settings);
server.on("ready", () => {
    console.log("SERVER ready");
});

const db = new AceBaseClient({
    host: "localhost",
    port: '5757',
    dbname: "mydb",
    https: false,
});
// const db = new AceBaseClient({ host: 'acebase.kuberez.io', port: 443, dbname: 'mydb', https: true });
db.auth.signIn("admin", "75sdDSFg37w5").then((result) => {
    console.log(
        `Signed in as ${result.user.username}, got access token ${result.accessToken}`
    );
});
db.ready(() => {
    console.log("Connected successfully");
});
const getCountDefinition = db.ref("userLists/everyone/share").once("value");
const updateCountDefinition = db.ref("userLists/everyone/share/count");
const inputInformation = db
    .ref("/definitions/$projectId/information")
    .on("value");
// const changedInformation = db.ref('/definitions/$projectId/information').on('mutate');

inputInformation.subscribe((snapshot) => {
    try {
        console.log("update Information!!");
        const vars = snapshot.ref.vars;

        const projectId = vars.projectId;
        console.log("projectId", projectId);
        const afterInformation = snapshot.val();

        const updateObj = {
            img: afterInformation.img,
            projectName: afterInformation.projectName,
            lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
            createdTimeStamp: afterInformation.createdTimeStamp,
            projectId: projectId,
            authorEmail: afterInformation.authorEmail,
            author: afterInformation.author,
            date: afterInformation.date,
            comment: afterInformation.comment,
            type: afterInformation.type,
        };
        if (afterInformation.permissions) {
            // delete permissions part
            var permissions = {};
            //after
            Object.keys(afterInformation.permissions).forEach((uid) => {
                permissions[uid] = afterInformation.permissions[uid];
            });

            Object.keys(permissions).forEach((uid) => {
                if (permissions[uid]) {
                    db.ref(`userLists/${uid}/share/${projectId}`)
                        .update(updateObj)
                        // .then(function () {
                        //     getCountDefinition.then(function (snapshot) {
                        //         var value = snapshot.val();
                        //         var array = Object.keys(value);
                        //         var count = array.length;
                        //         if (array.indexOf("count") != -1) {
                        //             count = count - 1;
                        //         }
                        //         updateCountDefinition.update(count);
                        //     });
                        // });
                    if (uid === "everyone") {
                        db.ref(
                            `userLists/${uid}/share_${afterInformation.type}/${projectId}`
                        ).update(updateObj);
                        db.ref(
                            `userLists/${uid}/share_first/${projectId}`
                        ).update(updateObj);
                    }
                } else {
                    db.ref(`userLists/${uid}/share/${projectId}`).remove();
                    if (uid === "everyone") {
                        // getCountDefinition.then(function (snapshot) {
                        //     var value = snapshot.val();
                        //     var array = Object.keys(value);
                        //     var count = array.length;
                        //     if (array.indexOf("count") != -1) {
                        //         count = count - 1;
                        //     }
                        //     updateCountDefinition.update(count);
                        // });
                        db.ref(
                            `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
                        ).remove();
                        db.ref(
                            `userLists/${uid}/share_first/${projectId}`
                        ).remove();
                    }
                }
            });
        }
        if (updateObj.author) {
            db.ref(`userLists/${updateObj.author}/mine/${projectId}`).update(
                updateObj
            );
        }
    } catch (e) {}
});
// exports.onRegisterUser
db.ref("__auth__/accounts/$uid")
    .on("value")
    .subscribe(async (snapshot, context) => {
        var uid = snapshot.ref.vars.uid;
        var userItem = snapshot.val();
        var userEmail = userItem.email;

        try {
            var convertEmail = userEmail.replace(/\./gi, "_");
            var getInvitationItem = null;
            var getRecommendedUserCoin = null;
            var updates = {};
            userItem["uid"] = uid;
            //invited 파악.
            db.ref(`enrolledUsers/${convertEmail}`).set(userItem);
        } catch (e) {
            return false;
        }
    });

// information이 업데이트 알림.
db.ref("/definitions/$projectId/information").on('mutated',
    snap => {
        try {
            var projectId = snap.ref.vars.projectId;
            const beforeInformation = snap.val();
            const afterInformation = snap.val();
            if (beforeInformation) {
                if (afterInformation) {
                    // modify
                    var updateObj = {
                        img: afterInformation.img,
                        projectName: afterInformation.projectName,
                        lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
                        createdTimeStamp: afterInformation.createdTimeStamp,
                        projectId: projectId,
                        authorEmail: afterInformation.authorEmail,
                        author: afterInformation.author,
                        date: afterInformation.date,
                        comment: afterInformation.comment,
                        type: afterInformation.type,
                    };
                    
                    var updateMineObj = {
                        author: afterInformation.author,
                        authorEmail: afterInformation.authorEmail,
                        img: afterInformation.img,
                        projectName: afterInformation.projectName,
                        lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
                        createdTimeStamp: afterInformation.createdTimeStamp,
                        projectId: projectId,
                        comment: afterInformation.comment,
                        type: afterInformation.type
                    };
                    //mine update
                    db.ref(
                            `userLists/${afterInformation.author}/mine/${projectId}/information`
                        )
                        .update(updateMineObj);

                    if (afterInformation.permissions) {
                        // delete permissions part

                        var permissions = {};

                        if (beforeInformation.permissions) {
                            Object.keys(beforeInformation.permissions).forEach(
                                (uid) => {
                                    permissions[uid] = null;
                                }
                            );

                            // Object.keys(beforeInformation.permissions).forEach(function (uid) {
                            //     permissions[uid] = null
                            // })
                        }

                        Object.keys(afterInformation.permissions).forEach(
                            (uid) => {
                                permissions[uid] =
                                    afterInformation.permissions[uid];
                            }
                        );
                        // Object.keys(afterInformation.permissions).forEach(function (uid) {
                        //     permissions[uid] = afterInformation.permissions[uid]
                        // })

                        Object.keys(permissions).forEach((uid) => {
                            if (permissions[uid]) {
                                snap.after.ref.root
                                    .child(
                                        `userLists/${uid}/share/${projectId}`
                                    )
                                    .update(updateObj);
                                if (uid === "everyone") {
                                    db.ref(
                                            `userLists/${uid}/share_${afterInformation.type}/${projectId}`
                                        )
                                        .update(updateObj);
                                }
                            } else {
                                db.ref(
                                        `userLists/${uid}/share/${projectId}`
                                    )
                                    .remove();
                                if (uid === "everyone") {
                                    db.ref(
                                            `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
                                        )
                                        .remove();
                                }
                            }
                        });
                    } else if (beforeInformation.permissions) {
                        // delete permissions all

                        Object.keys(beforeInformation.permissions).forEach(
                            (uid) => {
                                if (uid) {
                                    db.ref(
                                            `userLists/${uid}/share/${projectId}`
                                        )
                                        .remove();
                                    if (uid === "everyone") {
                                        db.ref(
                                                `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
                                            )
                                            .remove();
                                    }
                                }
                            }
                        );
                    }
                }
                return true;
            } else {
                return true;
            }
        } catch (e) {
            console.log(e);
        }
    }
);

// const removeDefinition = inputInformation.subscribe((snapshot) => {
//     try {
//         console.log("snapshot");
//         if (snapshot.val() == null) {
//             const vars = snapshot.ref.vars;
//             var projectId = vars.projectId;
//             const afterInformation = snapshot.val();
//             if (afterInformation.permissions) {
//                 Object.keys(afterInformation.permissions).forEach((uid) => {
//                     db.ref(`userLists/${uid}/share/${projectId}`).remove();
//                     if (uid === "everyone")
//                         db.ref(
//                             `userLists/${uid}/share_${afterInformation.type}/${projectId}`
//                         ).remove();
//                 });
//             }
//             return db
//                 .ref(`userLists/${afterInformation.author}/mine/${projectId}`)
//                 .remove();
//         }
//     } catch (e) {
//         console.log("/definitions/$projectId/information2");
//         console.log(e);
//     }
// });

const deleteDefinition = db.ref("/userLists/$uid/mine/$projectId").on("value");
deleteDefinition.subscribe((snapshot) => {
    try {
        if (snapshot.val() == null) {
            const vars = snapshot.ref.vars;
            var userUid = vars.uid;
            var projectId = vars.projectId;
            console.log(userUid, projectId);
            db.ref(`definitions/${projectId}/information/permissions`).once(
                "value",
                (permissionsSnapshots) => {
                    if (permissionsSnapshots.exists()) {
                        var userList = permissionsSnapshots.val();
                        Object.keys(userList).forEach((uid) => {
                            if (userList[uid] && uid !== "everyone") {
                                db.ref(
                                    `userLists/${uid}/share/${projectId}`
                                ).update({ state: "deleted" });
                            }
                        });
                    }
                }
            );
            //public delete
            // db.ref(`userLists/everyone/share/${projectId}`)
            //     .remove()
            //     .then(function () {
            //         getCountDefinition.then(function (snapshot) {
            //             var value = snapshot.val();
            //             var array = Object.keys(value);
            //             var count = array.length;
            //             if (array.indexOf("count") != -1) {
            //                 count = count - 1;
            //             }
            //             updateCountDefinition.update(count);
            //         });
            //     });
            db.ref(`userLists/everyone/share_es/${projectId}`)
                .remove()
                .then(function () {});
            db.ref(`userLists/everyone/share_first/${projectId}`)
                .remove()
                .then(function () {});
            return;
        }
    } catch (e) {
        console.log("/userLists/$uid/mine/$projectId");
        console.log(e);
    }
});

// db.ref('/userLists/everyone/share/{projectId}')
//     .mutate(async(snapshot, context) => {
//         const delayMs = 60 * 1000;
//         var beforeSnap = snapshot.before
//         var afterSnap = snapshot.after
//         var isCreate = !beforeSnap.exists() && afterSnap.exists()
//         var isUpdate = beforeSnap.exists() && afterSnap.exists()
//         var isDelete = beforeSnap.exists() && !afterSnap.exists()
//         try {
//             if(isUpdate){
//                 return true
//             }

//             var sanpshotCnt = null

//             afterSnap.ref.root.child('userLists/everyone/share/count').once('value', (publicModelListCnt) => {
//                 if (publicModelListCnt.exists()) {
//                     sanpshotCnt = publicModelListCnt.val()
//                     if(isCreate){
//                         sanpshotCnt = sanpshotCnt + 1
//                     } else if(isDelete){
//                         sanpshotCnt = sanpshotCnt - 1
//                     }
//                     afterSnap.ref.root.child(`userLists/everyone/share/count`).set(sanpshotCnt);
//                 }
//             })
//             return true
//         } catch (e) {
//             await delayTime(delayMs)
//             return false
//         }
//     });
// db.ref("/userLists/$authorId/mine/$projectId").on("child_removed", (snapshot) => {
//     console.log("remove")
//     console.log(snapshot)
// })
db.ref("/userLists/$authorId/mine").on("child_removed", (snapshot) => {
    // console.log("remove!!!!!!!!!!!")
    const vars = snapshot.val();
    console.log(vars.projectId)
    db.ref(`/definitions/${vars.projectId}`).remove()
})

db.ref("/userLists/$authorId/mine").on("child_added", (snapshot) => {
    // console.log("remove!!!!!!!!!!!")
    const vars = snapshot.val();
    console.log(vars.projectId)
    db.ref(`/definitions/${vars.projectId}/information`).set(vars)
})
// input Mine Lists when make Modeling
db.ref("/definitions/{projectId}/information").on(
    "child_added",
    (snapshot, context) => {
        console.log("***********")
        console.log(snapshot);
        console.log(context);
        var projectId = context.params.projectId;
        const afterInformation = snapshot.val();
        
        console.log(afterInformation.lastModifiedTimeStamp)
        var updateObj = {
            img: afterInformation.img,
            projectName: afterInformation.projectName,
            lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
            createdTimeStamp: afterInformation.createdTimeStamp,
            projectId: projectId,
            authorEmail: afterInformation.authorEmail,
            author: afterInformation.author,
            authorProfile: afterInformation.authorProfile
                ? afterInformation.authorProfile
                : null,
            date: afterInformation.date,
            comment: afterInformation.comment,
            type: afterInformation.type,
        };

        return snapshot.ref.root
            .child(`userLists/${updateObj.author}/mine/${projectId}`)
            .update(updateObj);
    }
);

// db.ref('/definitions/$projectId/versionLists/$version').on('child_added', (snapshot, context) => {
//     console.log(snapshot)
//     console.log(context)
//     var projectId = context.params.projectId
//     const afterInformation = snapshot.val();

//     var updateObj = {
//         img: afterInformation.img,
//         projectName: afterInformation.projectName,
//         lastModifiedDate: afterInformation.lastModifiedDate,
//         projectId: projectId,
//         authorEmail: afterInformation.authorEmail,
//         author: afterInformation.author,
//         authorProfile: afterInformation.authorProfile ? afterInformation.authorProfile : null,
//         date: afterInformation.date,
//         comment: afterInformation.comment,
//         type: afterInformation.type,
//     }

//     return snapshot.ref.root.child(`userLists/${updateObj.author}/mine/${projectId}`).update(updateObj);
// });

// function bpmParser(projectName, model) {

// }

// 사용 하지 않음
function bpmParser(projectName, model) {
    return new Promise(async function (resolve) {
        let elements = _.pickBy(model.elements);
        let relations = _.pickBy(model.relations);
        let childActivities = [];
        let sequenceFlows = [];
        let roles = [];
        const elementsTmp = Object.keys(elements).forEach(function (key) {
            let element = elements[key];
            element.name = {
                _type: "org.uengine.contexts.TextContext",
                text: elements[key].name,
            };
            if (element._type.includes("Role")) {
                roles.push(element);
                delete elements[key].elementView;
            } else {
                childActivities.push(element);
                delete elements[key].elementView;
            }
        });

        // console.log(elementsTmp)
        const relationsTmp = Object.keys(relations).forEach(function (key) {
            // let relation = relations[key]
            // relation.name = {
            //     "_type": "org.uengine.contexts.TextContext",
            //     "text": relation[key].name
            // }
            sequenceFlows.push(relations[key]);

            delete relations[key].relationView;
        });

        Promise.all([elementsTmp, relationsTmp]).then(function (values) {
            // console.log(values[0])
            // console.log(values[1])
            // model["childActivities"] = {"_type":"java.util.ArrayList", childActivities}
            // model["sequenceFlows"] = {"_type:": "java.util.ArrayList", sequenceFlows}
            model["childActivities"] = childActivities;
            model["sequenceFlows"] = sequenceFlows;
            model["roles"] = roles;
            // model.sequenceFlows = ["java.util.ArrayList",relations]
            delete model["relations"];
            delete model["elements"];
            resolve(model);
        });
    });
}

// function bpmParser(projectName, model) {
//     // Keyboard.json 양식에 맞춤
//     // 동작 하지 않음.
//     return new Promise(async function (resolve) {
//         let result = {
//             "definition": {
//               "_type": "org.uengine.kernel.ProcessDefinition",
//               "name": {
//                 "text": projectName
//               },
//               "retryDelay": 60,
//               "isDynamicChangeAllowed": true,
//               "childActivities": [
//                 "java.util.ArrayList",
//                 []
//               ],
//               "sequenceFlows": [],
//               "defaultFlowchartViewType": "swimlane",
//               "defaultFlowchartViewOption": "vertical",
//               "duration": 10,
//               "simulationInstanceCount": 10,
//               "simulationInputFrequency": 10,
//               "archive": true,
//               "id": "keyboard.xml",
//               "isAdhoc": true,
//               "shortDescription": {
//                 "localedTexts": {
//                   "_type": "java.util.HashMap",
//                   "ko": ""
//                 }
//               },
//               "initiateByFirstWorkitem": true,
//               "adhoc": true,
//               "dynamicChangeAllowed": true
//             }
//         }

//         const activity = Object.keys(model.elements).forEach(function(key) {
//             result.definition.childActivities[1].push(model.elements[key]);
//           })

//         let relations = {}
//         const sequence = Object.keys(model.relations).forEach(function(key, idx) {
//             // result.definition.sequenceFlows[1].push(model.relations[key]);
//             result.definition.sequenceFlows.push(model.relations[key])
//         })

//         await Promise.all([activity, sequence])
//         // result.definition.sequenceFlows.push(relations)

//         resolve(result)
//     })
// }

app.get("/api/definitions/:definition", async function (req, res, next) {
    const snapshot = await db.ref(`definitions/${req.params.definition}`).get();
    if (snapshot.exists()) {
        const tmp = snapshot.val();
        const lastVersion = tmp.information.lastVersionName;
        console.log(tmp.versionLists[lastVersion].versionValue.value);
        const lastValue = JSON.parse(
            tmp.versionLists[lastVersion].versionValue.value
        );
        console.log(lastVersion);
        const result = await bpmParser(req.params.definition, lastValue);
        res.status(200).json(result);
        console.log(result);
    } else {
        res.status(500);
    }
});

// app.get('/api/definitions/:definition/lastVersion', async function(req, res, next) {
//     // console.log(req.params)
//     console.log(req.params.definition)
//     const snapshot = await db.ref(`definitions/${req.params.definition}/information/lastVersionName`).get();
//     if (snapshot.exists()) {
//         result = snapshot.val();
//         res.status(200).json(result);
//         console.log("return")
//     }
//     else {
//         res.status(500)
//     }
// });

const application = app.listen(5758, () => {
    console.log("server open");
});

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
function shutDown() {
    console.log("Received kill signal, shutting down gracefully");
    application.close(() => {
        console.log("Closed out remaining connections");
        process.exit(0);
    });

    setTimeout(() => {
        console.error(
            "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
    }, 10000);

    // connections.forEach(curr => curr.end());
    // setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


// helm install gitlab gitlab/gitlab \
//   --set global.HTMLProgressElement.domain=msaez.io \
//   --set certmanager.install=false \
//   --set global.ingress.configureCertmanager=false \
//   --set global.ingress.tls.secretName=quickstart-example-tls