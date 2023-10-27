const { AceBaseServer } = require('acebase-server');
const dbname = 'mydb';
const settings = {
    host: 'localhost',
    port: 5757,
    authentication: {
        enabled: true,
        // allowUserSignup: true,
        defaultAccessRule: 'allow',
        defaultAdminPassword: '75sdDSFg37w5'
    }
}
const server = new AceBaseServer(dbname, settings);

server.on("ready", () => {
    console.log("SERVER ready");
});

const { AceBaseClient } = require('acebase-client');
const db = new AceBaseClient({ host: 'localhost', port: 5757, dbname: 'mydb', https: false });
// const db = new AceBaseClient({ host: 'acebase.kuberez.io', port: 443, dbname: 'mydb', https: true });
db.auth.signIn('admin', '75sdDSFg37w5')
.then(result => {
    console.log(`Signed in as ${result.user.username}, got access token ${result.accessToken}`);
})
db.ready(() => {
    console.log('Connected successfully');
});
const getCountDefinition = db.ref('userLists/everyone/share').once('value');
const updateCountDefinition = db.ref('userLists/everyone/share/count');
const inputInformation = db.ref('/definitions/$projectId/information').on('value');
const changedInformation = db.ref('/definitions/$projectId/information').on('mutate');

inputInformation.subscribe(snapshot => {
    try{
        console.log("update Information!!")
        const vars = snapshot.ref.vars;
        const projectId = vars.projectId;
        const afterInformation = snapshot.val();

        const updateObj = {
                img: afterInformation.img,
                projectName: afterInformation.projectName,
                lastModifiedDate: afterInformation.lastModifiedDate,
                projectId: projectId,
                authorEmail: afterInformation.authorEmail,
                author: afterInformation.author,
                date: afterInformation.date,
                comment: afterInformation.comment,
                type: afterInformation.type,
        }
        console.log(afterInformation.permissions)   
        if (afterInformation.permissions) {
            // delete permissions part
            var permissions = {}
            //after
            Object.keys(afterInformation.permissions).forEach((uid) => {
                permissions[uid] = afterInformation.permissions[uid]
            })

            Object.keys(permissions).forEach((uid) => {
                if (permissions[uid]) {
                    db.ref(`userLists/${uid}/share/${projectId}`).update(updateObj).then(function (){
                        getCountDefinition.then(function (snapshot) {
                            var value = snapshot.val();
                            var array = Object.keys(value);
                            var count = array.length;
                            if(array.indexOf("count") != -1 ) {
                                count = count -1
                            } 
                            updateCountDefinition.update(count)
                        })
                    });
                    if (uid === 'everyone') {
                        db.ref(`userLists/${uid}/share_${afterInformation.type}/${projectId}`).update(updateObj);
                        db.ref(`userLists/${uid}/share_first/${projectId}`).update(updateObj);
                    }
                } else {
                    db.ref(`userLists/${uid}/share/${projectId}`).remove();
                    if (uid === 'everyone') {
                        getCountDefinition.then(function (snapshot) {
                            var value = snapshot.val();
                            var array = Object.keys(value);
                            var count = array.length;
                            if(array.indexOf("count") != -1 ) {
                                count = count -1
                            } 
                            updateCountDefinition.update(count)
                        })
                        db.ref(`userLists/${uid}/share_${beforeInformation.type}/${projectId}`).remove();
                        db.ref(`userLists/${uid}/share_first/${projectId}`).remove();
                    }
                }
            })
        }
        if(updateObj.author) {
            db.ref(`userLists/${updateObj.author}/mine/${projectId}`).update(updateObj);
        }
    } catch (e) {

    }
    
});
// exports.onRegisterUser
db.ref('__auth__/accounts/$uid')
    .on('value').subscribe(async (snapshot, context) => {
        var uid = snapshot.ref.vars.uid;
        var userItem = snapshot.val();
        var userEmail = userItem.email
        
        try {
            var convertEmail = userEmail.replace(/\./gi, "_");
            var getInvitationItem = null;
            var getRecommendedUserCoin = null;
            var updates = {};
            userItem['uid'] = uid;
            //invited 파악.
            db.ref(`enrolledUsers/${convertEmail}`).set(userItem)
        } catch (e) {
            return false
        }

    });


// information이 업데이트 알림.
// db.ref('/definitions/{projectId}/information')
//     .getMutations((change, context) => {
//         var projectId = context.params.projectId
//         const beforeInformation = change.before.val();
//         const afterInformation = change.after.val();

//         if (beforeInformation) {
//             if (afterInformation) {
//                 // modify
//                 var updateObj = {
//                     img: afterInformation.img,
//                     projectName: afterInformation.projectName,
//                     lastModifiedDate: afterInformation.lastModifiedDate,
//                     projectId: projectId,
//                     authorEmail: afterInformation.authorEmail,
//                     author: afterInformation.author,
//                     date: afterInformation.date,
//                     comment: afterInformation.comment,
//                     type: afterInformation.type,
//                 }

//                 var updateMineObj = {
//                     author: afterInformation.author,
//                     authorEmail: afterInformation.authorEmail,
//                     img: afterInformation.img,
//                     projectName: afterInformation.projectName,
//                     lastModifiedDate: afterInformation.lastModifiedDate,
//                     comment: afterInformation.comment,
//                 }

//                 //mine update
//                 change.after.ref.root.child(`userLists/${afterInformation.author}/mine/${projectId}`).update(updateMineObj);

//                 if (afterInformation.permissions) {
//                     // delete permissions part

//                     var permissions = {}

//                     if (beforeInformation.permissions) {
//                         Object.keys(beforeInformation.permissions).forEach((uid) => {
//                             permissions[uid] = null
//                         })

//                         // Object.keys(beforeInformation.permissions).forEach(function (uid) {
//                         //     permissions[uid] = null
//                         // })
//                     }

//                     Object.keys(afterInformation.permissions).forEach((uid) => {
//                         permissions[uid] = afterInformation.permissions[uid]
//                     })
//                     // Object.keys(afterInformation.permissions).forEach(function (uid) {
//                     //     permissions[uid] = afterInformation.permissions[uid]
//                     // })


//                     Object.keys(permissions).forEach((uid) => {
//                         if (permissions[uid]) {
//                             change.after.ref.root.child(`userLists/${uid}/share/${projectId}`).update(updateObj);
//                             if (uid === 'everyone') {
//                                 change.after.ref.root.child(`userLists/${uid}/share_${afterInformation.type}/${projectId}`).update(updateObj);
//                             }
//                         } else {
//                             change.after.ref.root.child(`userLists/${uid}/share/${projectId}`).remove();
//                             if (uid === 'everyone') {
//                                 change.after.ref.root.child(`userLists/${uid}/share_${beforeInformation.type}/${projectId}`).remove();
//                             }
//                         }
//                     })

//                 } else if (beforeInformation.permissions) {
//                     // delete permissions all

//                     Object.keys(beforeInformation.permissions).forEach((uid) => {
//                         if (uid) {
//                             change.before.ref.root.child(`userLists/${uid}/share/${projectId}`).remove();
//                             if (uid === 'everyone') {
//                                 change.before.ref.root.child(`userLists/${uid}/share_${beforeInformation.type}/${projectId}`).remove();
//                             }
//                         }
//                     })
//                 }
//             }
//             return true
//         } else {
//             return true
//         }
//     });

const removeDefinition = inputInformation.subscribe(snapshot => {
    try{
        console.log("snapshot")
        if(snapshot.val() == null) {
            const vars = snapshot.ref.vars;
            var projectId = vars.projectId
            const afterInformation = snapshot.val();
            if (afterInformation.permissions) {
                Object.keys(afterInformation.permissions).forEach((uid) => {
                    db.ref(`userLists/${uid}/share/${projectId}`).remove();
                    if (uid === 'everyone')
                        db.ref(`userLists/${uid}/share_${afterInformation.type}/${projectId}`).remove();
                })
            }
            return db.ref(`userLists/${afterInformation.author}/mine/${projectId}`).remove();
        }
    } catch (e) {
        console.log('/definitions/$projectId/information2');
        console.log(e);
    }
});

const deleteDefinition = db.ref('/userLists/$uid/mine/$projectId').on('value');
deleteDefinition.subscribe(snapshot => {
    try {
        if(snapshot.val() == null) {
            const vars = snapshot.ref.vars;
            var userUid = vars.uid
            var projectId = vars.projectId
            console.log(userUid, projectId)
            db.ref(`definitions/${projectId}/information/permissions`).once('value', (permissionsSnapshots) => {
                if (permissionsSnapshots.exists()) {
                    var userList = permissionsSnapshots.val()
                    Object.keys(userList).forEach((uid) => {
                        if (userList[uid] && uid !== 'everyone') {
                            db.ref(`userLists/${uid}/share/${projectId}`).update({state: 'deleted'})
                        }
                    })
                }
            })
            //public delete
            db.ref(`userLists/everyone/share/${projectId}`).remove().then(function (){
                getCountDefinition.then(function (snapshot) {
                    var value = snapshot.val();
                    var array = Object.keys(value);
                    var count = array.length;
                    if(array.indexOf("count") != -1 ) {
                        count = count -1
                    } 
                    updateCountDefinition.update(count)
                })
            });
            db.ref(`userLists/everyone/share_es/${projectId}`).remove().then(function () {
            })
            db.ref(`userLists/everyone/share_first/${projectId}`).remove().then(function () {
            })
            return;
        }
    } catch (e) {
        console.log('/userLists/$uid/mine/$projectId');
        console.log(e)
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