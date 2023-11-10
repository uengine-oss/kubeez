<template>

</template>

<script>
    import TenantAware from "../../labs/TenantAware";

    export default {
        name: "storage-base-abstract",
        mixins: [TenantAware],
        props: {
            archive: Boolean
        },
        data() {
            return {
                accessToken: null,
                userInfo: {
                    name: null,
                    profile: null,
                    email: null,
                    uid: null,
                    savedCoin: 0,
                    savedToolTime: 0,
                    consultingTime: 0,
                    authorized: null,
                },
                userImage: null
            }
        },
        computed: {
            myId() {
                if (this.userInfo.email)
                    return this.userInfo.email
                return localStorage.getItem("email");
            },
            isLogin() {
                // if (this.getRef('auth').currentUser) {
                if (this.accessToken) {
                    return true
                }
                return false
            },
            isGuestLogin() {
                if (!this.accessToken && this.userInfo.name) {
                    return true
                }
                return false
            },
            myHashCode() {
                return this.hashCode(this.courseId + '/classes/' + this.classId + '/labs/' + this.labId + '/' + this.myId)
            },
            isAdmin() {
                if (this.isLogin) {
                    if (this.classInfo != null) {
                        if (this.classInfo.teacherId == this.myId) {
                            return true
                        } else if (window.localStorage.getItem('authorized') == 'admin') {
                            return true
                        }
                    } else if (window.localStorage.getItem('authorized') == 'admin') {
                        return true
                    }
                }
                return false
            },
            isTeacher() {
                if (this.classInfo) {
                    if (this.classInfo.teacherId == this.myId) {
                        return true
                    }
                }
                return false
            },
            courseId() {
                return this.$route.params.courseId;
            },
            labId() {
                return this.$route.params.labId;
            },
            classId() {
                return this.$route.params.classId;
            },
            classStatus() {
                return this.$route.params.status;
            },
        },
        methods: {
            //options - sort. query, size, page, key, startAt, endAt
            /// underbar methods are ABSTRACT METHODS that must be implemented by derived classes
            _getMetadata(path) {
                throw new Error("must be implemented")
            },
            _list(path, metadata, tenant) {
                throw new Error("must be implemented")
            },
            async _get(path, tenant) {
                throw new Error("must be implemented")
            },
            _put(path, string) {
                throw new Error("must be implemented")
            },
            _push(path, string) {
                throw new Error("must be implemented")
            },
            _delete(path) {
                throw new Error("must be implemented")
            },
            _getURL(path, tenant) {
                throw new Error("must be implemented")
            },
            _signUp(path, userInfo) {
                throw new Error("must be implemented")
            },
            _signIn(path, metadata, tenant) {
                throw new Error("must be implemented")
            },
            _isConnection(path, callback) {
                throw new Error("must be implemented")
            },
            isConnection(path, callback) {
                return this._isConnection(path, callback);
            },
            watch(path, callback) {
                return this._watch(path, callback)
            },
            async list(path, options, tenant) {
                return await this._list(path, options, tenant);
            },
            list_watch(path, options, callback) {
                return this._list_watch(path, options, callback)
            },
            //delete
            async delete(path) {
                return await this._delete(path)
            },
            async getMetadata(path) {
                return await this._getMetadata(path);
            },
            //get
            async getString(path, tenant) {
                return await this._get(path, tenant);
            },
            async getObject(path, tenant) {
                try {
                    var string = await this._get(path, tenant);
                    if (typeof string == 'string')
                        var data = JSON.parse(string);
                    else
                        var data = string

                    return data;
                } catch (e) {
                    console.log(e)
                    return undefined
                }
            },
            //update
            async putString(path, string) {
                return await this._put(path, string, true);
            },
            async putObject(path, obj) {
                var string = obj
                if (typeof string == 'object') {
                    string = JSON.stringify(obj);
                }
                return await this._put(path, string);
            },
            //put
            async pushString(path, string) {
                return await this._push(path, string, true);
            },
            async pushObject(path, obj) {
                var string = JSON.stringify(obj);
                return await this._push(path, string);
            },
            //set
            async setString(path, string) {
                return await this._set(path, string, true);
            },
            async setObject(path, obj) {
                var string = JSON.stringify(obj);
                return await this._set(path, string);
            },
            isValidatePath(path) {
                return this._isValidatePath(path)
            },
            getRef(auth) {
                return this._getRef(auth)
            },
            async refreshFirebaseIdToken() {
                return await this._refreshFirebaseIdToken()
            },
            async getUserInfo() {
                return await this._getUserInfo()
            },
            async getURL(path, tenant) {
                return await this._getURL(path, tenant);
            },
            getLabInfo(labId) {
                var me = this
                return new Promise(async function (resolve) {
                    if (!labId) labId = me.labId;
                    var classId = me.classInfo ? me.classInfo.classId : me.classId
                    var labPath = `storage://labs-msaez.io/running/${me.courseId}/labs/${labId}/Lab_Metadata.json`
                    var labPricePath = `db://pricing/${me.courseId}@${classId}@${labId}`
                    // var labPricePath = `db://pricing/${me.courseId}@${classId}@${labId}`
                    var labInfo = await me.getObject(labPath);
                    var labPrice = await me.getString(labPricePath);
                    if (!labInfo) labInfo = {};
                    labInfo.labId = labId;
                    if (labPrice) labInfo.price = labPrice / 100

                    if (labInfo.video) {
                        let labVideoPrice = 0;
                        let videoId = labInfo.video.split('/')[labInfo.video.split('/').length - 1]
                        labVideoPrice = await me.getString(`db://pricing/video@${videoId}`);
                        labVideoPrice = labVideoPrice ? Number(labVideoPrice) : 0
                        labInfo.videoPrice = labVideoPrice
                        labInfo.videoPeriod = labInfo.videoPeriod ? labInfo.videoPeriod : 90;
                    }
                    var labDataList = await me.list(`storage://labs-msaez.io/running/${me.courseId}/labs/${labId}`);
                    labDataList.items.forEach(async function (labData, idx) {
                        if (labData.location.path_.includes("instruction")) {
                            var markdown = await me.getString(`storage://${labData.location.path_}`)
                            try {
                                labInfo.instructionMd = markdown
                                resolve(labInfo);
                            } catch (e) {
                                labInfo.instructionMd = e.message
                                resolve(labInfo);
                            }
                        } else if (labData.location.path_.includes("theory")) {
                            try {
                                labInfo.theoryHtml = theoryMD.includes('<') ? theoryMD : marked(theoryMD, {sanitize: true})
                                resolve(labInfo);
                            } catch (e) {
                                labInfo.theoryHtml = e.message
                                resolve(labInfo);
                            }
                        }
                    })
                    // var markdownHtml = await me.getString(`storage://labs-msaez.io/running/${me.courseId}/labs/${labId}/instruction.html`)
                    // var theoryMD = await me.getString(`storage://labs-msaez.io/running/${me.courseId}/labs/${labId}/theory.md`)
                    // if (theoryMD) {
                    //
                    // }
                    //todo: load javascript here
                })
            },
            getClassInfo: async function () {
                var me = this
                // var rootPath = this.archive ? 'archive/':'running/'
                return new Promise(async function (resolve, reject) {
                    try {
                        if (window.MODE == 'onprem') {
                            return;
                        }
                        var path = me.getClassPath('Class_Metadata.json');
                        var classInfo = await me.getObject(`storage://labs-msaez.io/running/${path}`);
                        if (!path.includes("undefined/classes/undefined") && !classInfo) {
                            // var path2 = window.location.hash.replace("/courses/running/", "/courses/archive/");
                            // path2[5] = 'archive'
                            // console.log(path2)
                            // window.open(path2);
                            // window.location.reload(path2)
                            // window.location.href = window.location.href.replace('/courses/running/', '/courses/archive/')
                            classInfo = await me.getObject(`storage://labs-msaez.io/archive/${path}`);
                            if (!classInfo.archive) classInfo.archive = true

                            //     var nameParts = path.split("/");
                            //     var roungePath = nameParts[0] + '/' + nameParts[2]
                            //     this.$router.push('/courses/archive/' + roungePath);
                        }
                        if (classInfo) {
                            classInfo.reuse = false
                            var now = Date.now();
                            var parseDate = new Date(classInfo.classEndDate)
                            parseDate.setDate(parseDate.getDate() + 1)
                            if (parseDate < now) {
                                classInfo.status = 'completed'
                            } else if (Date.parse(classInfo.classStartDate) < now && now < parseDate) {
                                classInfo.status = 'running'
                            } else if (now < Date.parse(classInfo.classStartDate)) {
                                classInfo.status = 'prepared'
                            }
                            if (classInfo.openClass || !classInfo.connectionKey) {
                                var enrolledUserList = await me.list(`db://labs/${me.getTenantId().split('.')[0] + '/' + me.getClassPath('enrolledUsers')}`)
                                if (!enrolledUserList) {
                                    var enrolledUserList = await me.list(`db://labs/${me.getTenantId().split('.')[0] + '/' + me.getOldClassPath('enrolledUsers')}`)
                                }
                                // openClass의 경우에는 Firebase에서만
                                var undefinedGroupList = {}
                                if (!enrolledUserList) {
                                    resolve(classInfo)
                                } else {
                                    var groupedUsers = {}
                                    // 조 파악
                                    Object.keys(enrolledUserList).forEach(function (key) {
                                        if (!enrolledUserList[key].email) {
                                            if (enrolledUserList[key].users) {
                                                enrolledUserList[key].users.forEach(function (user) {
                                                    var hashName = me.hashCode(user)
                                                    enrolledUserList[hashName] = user
                                                })
                                            }
                                        } else {
                                            if (!enrolledUserList[key].group) {
                                                enrolledUserList[key].group = '미배정'
                                            }

                                            if (Object.keys(groupedUsers).indexOf(enrolledUserList[key].group) == -1) {
                                                groupedUsers[enrolledUserList[key].group] = {
                                                    users: []
                                                }
                                            }
                                            groupedUsers[enrolledUserList[key].group].users.push(enrolledUserList[key])
                                        }
                                    })
                                    classInfo["groupedUsers"] = groupedUsers
                                    classInfo["enrolledUsersList"] = enrolledUserList

                                    await me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`), enrolledUserList)
                                    resolve(classInfo)
                                }

                            } else {
                                // openClass가 아닌 경우에는 classMetadata + Firebase
                                resolve(classInfo)
                            }
                        }
                    } catch (e) {
                        if (!classInfo) {
                            console.log('classInfo: null')
                        } else {
                            alert('getClassInfo: ', e.message)
                        }
                        resolve(null)
                    }


                })

            },
            getClassPath(path) {
                if (this.classId) {
                    var classId = this.classId.replace('@', '/')
                } else {
                    if (this.$route.query.classId)
                        var classId = this.$route.query.classId.replace('@', '/')
                }

                if (this.courseId) {
                    var courseId = this.courseId
                } else {
                    var courseId = this.$route.query.courseId
                }
                return `${courseId}/classes/${classId}/${path}`;
            },
            getOldClassPath(path) {
                if (this.classId) {
                    var classId = this.classId.replace('@', '/')
                } else {
                    if (this.$route.query.classId)
                        var classId = this.$route.query.classId.replace('@', '/')
                }

                if (this.courseId) {
                    var courseId = this.courseId
                } else {
                    var courseId = this.$route.query.courseId
                }
                return `${courseId}/classes/running/${classId}/${path}`;
            },
            async getCourseInfo() {
                return await this.getObject(`storage://labs-msaez.io/running/${this.courseId}/Course_Metadata.json`);
            },
            async getLabStatus(labId) {
                var me = this;

                var statusFilesMd = await this.list(`storage://labs-msaez.io/running/${me.getClassPath(`labs/${labId}/status/`)}`);
                var labStatus = {
                    status: 'READY'
                }

                // if (statusFilesMd.items.length > 0)
                //     statusFilesMd.forEach(item => {   //Event Sourcing:  replaying the histories takes you to the current state
                //         if (item.name.endsWith('completed')) {
                //             labStatus.status = 'completed';
                //             labStatus.completedAt = item.lastModified;
                //         } else if (item.name.endsWith('started')) {
                //             labStatus.status = 'started';
                //             labStatus.startedAt = item.lastModified;
                //         }
                //     });

                return labStatus;
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            _setUserInfo(user) {
                if (this.$isElectron) {
                    this.userInfo.name = localStorage.getItem('userName')
                    this.userInfo.profile = localStorage.getItem('picture')
                    this.userInfo.email = localStorage.getItem('email')
                    this.userInfo.uid = localStorage.getItem('uid')
                    this.userInfo.authorized = localStorage.getItem('authorized')
                    this.accessToken = localStorage.getItem('accessToken')
                } else if (user) {
                    this.userInfo.name = user.name
                    this.userInfo.profile = user.profile
                    this.userInfo.email = user.email
                    this.userInfo.uid = user.uid
                    this.userInfo.authorized = localStorage.getItem('authorized')
                    this.accessToken = user.accessToken
                } else {
                    this.userInfo.name = localStorage.getItem('userName')
                    this.userInfo.profile = localStorage.getItem('picture')
                    this.userInfo.email = localStorage.getItem('email')
                    this.userInfo.uid = localStorage.getItem('uid')
                    this.userInfo.authorized = localStorage.getItem('authorized')
                    this.accessToken = localStorage.getItem('accessToken')
                }

            },
            async signUp(path, userInfo) {
                return await this._signUp(path, userInfo)
            },
            async signIn(path, userInfo) {
                return await this._signIn(path, userInfo)
            },
            initUserInfo() {
                this.userInfo.name = null
                this.userInfo.profile = null
                this.userInfo.email = null
                this.userInfo.uid = null
                this.userInfo.authorized = null
                this.accessToken = null
                this.userInfo.savedCoin = 0
                this.userInfo.savedToolTime = 0
                this.userInfo.consultingTime = 0
            },
            async getUserPurchaseLists() {
                var me = this
                if (me.isLogin) {
                    try {
                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                        var version = 0
                        version = await me.getString(`db://enrolledUsers/${convertEmail}/version`)

                        me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/coin`, function (item) {
                            if (item) {
                                me.userInfo.savedCoin = Number(item)
                            } else {
                                me.userInfo.savedCoin = 0
                            }
                        });
                        me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/ideTime`, function (item) {
                            if (item) {
                                me.userInfo.savedToolTime = Number(item)
                            } else {
                                me.userInfo.savedToolTime = 0
                            }
                        });
                        me.watch(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/consultingTime`, function (item) {
                            if (item) {
                                me.userInfo.consultingTime = Number(item)
                            } else {
                                me.userInfo.consultingTime = 0
                            }
                        });
                    } catch (e) {
                        console.log(e)
                        alert(e)
                    }
                }

            },

        }

    };
</script>