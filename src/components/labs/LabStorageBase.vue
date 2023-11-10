<template>
</template>

<script>
    // import StorageBase from "../designer/modeling/StorageBase";
    import StorageBase from "../CommonStorageBase";

    export default {
        name: 'lab-storage-base',
        mixins: [StorageBase],
        data: {
            classInfo: null,
        },
        computed: {
            isEnterpriseClass() {
                if (this.classInfo && !this.classInfo.openClass && this.classInfo.connectionKey) {
                    return true
                }
                return false
            },
            // isOwner() {
            //     var courseInfo = this.getCourseInfo();
            //     if (courseInfo != null) {
            //         if (courseInfo.ownerId && courseInfo.ownerId == this.myId) {
            //             return true
            //         } else if (!courseInfo.ownerId && this.myId == 'jyjang@uengine.org') {
            //             return true
            //         }
            //     } 
            //     return false
            // },
            isTeacher() {
                var me = this
                if (me.classInfo) {
                    if (me.classInfo.teacherId == this.myId) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return null
                }
            },
            isAdmin() {
                if (this.classInfo) {
                    if (this.classInfo.teacherId == this.myId) {
                        return true
                    } else if (window.localStorage.getItem('authorized') == 'admin') {
                        return true
                    }
                } else if (window.localStorage.getItem('authorized') == 'admin') {
                    return true
                }
                return false
            },
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        },
        async created() {
            var me = this
            await me.loginUser()

            // Not Install Mode 
            if(window.MODE != "onprem"
                && me.$route.path
                && me.$route.path != '/courses'
                && me.$route.path != '/courses/'
                && me.$route.path.includes('/courses')
            ){
                var userId = localStorage.getItem('email')
                var classInfo = await this.getClassInfo();
                me.classInfo = classInfo
                me.uploadUserData();

                if (classInfo && classInfo.connectionKey) {
                    //기업강의
                    if (!classInfo.openClass) {
                        //connectionKey 0 , openClass x
                        var connectionClassId = this.$route.query.classId ? this.$route.query.classId : this.$route.params.classId
                        var userEmail = localStorage.getItem('email')

                        if (me.isAdmin || classInfo.teacherId == userEmail) {
                            // classInfo.connectionKey = true
                        } else if (!localStorage.getItem(connectionClassId) || !userId) {
                            var routerlink = `/login-page?courseId=${me.courseId}&classId=${me.classId}`
                            //로그인 파악.
                            if (!window.location.href.includes("login-page")) {
                                if (me.labId) {
                                    routerlink = routerlink + `&labId=${me.labId}`
                                }
                                me.$router.push(routerlink);
                                return;
                            }


                        } else if (localStorage.getItem(connectionClassId) != classInfo.connectionKey) {
                            alert("접속 키가 다릅니다")
                            localStorage.removeItem(connectionClassId);
                            window.location.reload();
                        }
                    }

                    //connectionKey 0, openClass 0
                    var userId = localStorage.getItem('email')
                    var userList = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`));
                    if (userId) {
                        if (!userList) {
                            userList = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`enrolledUsers/`));
                        }
                        if (userId) {
                            if (!userList) {
                                me.uploadUserData()
                            } else {
                                var enrolledUserList = []
                                Object.keys(userList).forEach(function (key) {
                                    enrolledUserList.push(userList[key].email)
                                })
                                const equalId = (element) => element == userId;
                                if (enrolledUserList.findIndex(equalId) == -1) {
                                    me.uploadUserData()
                                }
                            }
                        }
                    }

                    var userList = []
                    if (classInfo && classInfo.groupedUsers) {
                        if (Object.keys(classInfo.groupedUsers).length > 0) {
                            Object.keys(classInfo.groupedUsers).forEach(function (groupKey) {
                                classInfo.groupedUsers[groupKey]["users"].forEach(function (user) {
                                    userList.push(user.email)
                                })
                            })
                            const equalId = (element) => element == localStorage.getItem('email');
                            if (userList.findIndex(equalId) == -1) {
                                me.uploadUserData();
                            }
                        } else {
                            me.uploadUserData()
                        }
                    } else {
                        me.uploadUserData()
                    }
                }
            }

        },
        methods: {
            async uploadUserData() {
                var me = this
                var userId = localStorage.getItem('email')
                if (me.classId) {
                    var classId = me.classId
                } else {
                    var classId = me.$route.query.classId
                }
                
                if (me.courseId) {
                    var courseId = me.courseId
                } else {
                    var courseId = me.$route.query.courseId
                }
                var modifiedUserName = await me.getModifiedUserName(courseId, classId, userId)
                var userName = modifiedUserName ? modifiedUserName : localStorage.getItem('userName')
                var userPicture = localStorage.getItem('picture') ? localStorage.getItem('picture') : null
                var uploadObject = {
                    userName: userName,
                    photoURL: userPicture,
                    email: userId
                }
                if (me.classInfo && userId) {
                    // me.putString('firebase://labs/' + `${me.getTenantId().split('.')[0]}/${courseId}/classes/${classId.replace('@', '/')}/enrolledUsers/${me.hashCode(userId)}`, uploadObject)
                    me.putObject('db://labs/' + `${me.getTenantId().split('.')[0]}/${courseId}/classes/${classId.replace('@', '/')}/enrolledUsers/${me.hashCode(userId)}`, uploadObject)
                }
            },
            async getModifiedUserName(courseId, classId, userId){
                return await this.getString('db://labs/' + `${this.getTenantId().split('.')[0]}/${courseId}/classes/${classId.replace('@', '/')}/enrolledUsers/${this.hashCode(userId)}/userName`)
            }
        },
    }
</script>


<style>
    /*.buy-dialog-title {*/

    /*}*/

    /*.buy-dialog-sub-title {*/

    /*}*/


</style>