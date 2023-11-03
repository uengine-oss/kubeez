<template>
    <div style="width: 100%; height: 100%;">
        <v-row style="width: 100%; height: 100%;">

            <div style="width: 10%; margin-left:5% ">
                <v-row>
                    <v-avatar
                            size="80"
                    >
                        <div v-if="getPersonalInfo.profile" style="width: 100%;height: 100%;">
                            <img
                                    :src="getPersonalInfo.profile"
                            >
                        </div>
                        <div v-else>
                            <v-icon>mdi-account-circle</v-icon>
                        </div>
                    </v-avatar>
                </v-row>
                <div style="margin-top: 8%;text-align: start; -webkit-text-stroke: thin;"> {{getPersonalInfo.name}}
                </div>
            </div>

            <div style="width: 80%; height: 100%;">

                <v-tabs vertical>
                    <v-tab style="justify-content: left;">
                        <v-icon left>
                            mdi-television-guide
                        </v-icon>
                        Models
                    </v-tab>
                    <v-tab style="justify-content: left;">
                        <v-icon left>
                            mdi-television-guide
                        </v-icon>
                        Courses
                    </v-tab>
                    <v-tab style="justify-content: left;">
                        <v-icon left>
                            mdi-television-guide
                        </v-icon>
                        Certificates
                    </v-tab>

                    <v-tab-item>
                        <v-card-text style="height: 100%; overflow-x: scroll;">
                            <v-row v-if="filterModelingItems == undefined  && typeof filterModelingItems != 'object'">
                                <v-col
                                        v-for="idx in 9"
                                        cols="6"
                                        md="4"
                                >
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 500px; height: 400px; justify-content: center"
                                            align="center"
                                    >
                                        <v-skeleton-loader
                                                ref="skeleton"
                                                type="card"
                                                class="mx-auto"
                                        >
                                        </v-skeleton-loader>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-row v-else-if="filterModelingItems == null">
                                전체 공개된 모델링이 없습니다.
                            </v-row>

                            <v-row v-else-if="filterModelingItems.length > 0 ">
                                <v-col v-for="(modeling) in filterModelingItems"
                                       :key="modeling.projectId"
                                       xl="4"
                                       lg="4"
                                       md="6"
                                       sm="12">
                                    <EventStormingListCard
                                            :information="modeling"
                                            read-only
                                    >
                                        <template slot="chips">
                                            <slot name="chips"></slot>
                                        </template>
                                        <template slot="action" slot-scope="modeling">
                                            <slot name="action" :project="modeling"></slot>
                                        </template>
                                    </EventStormingListCard>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-tab-item>

                    <v-tab-item>
                        <v-card-text style="height: 90%;">
                            <v-tabs>
                                <v-tab>
                                    <v-icon left>
                                        mdi-television-guide
                                    </v-icon>
                                    Passed Classes
                                </v-tab>
                                <v-tab>
                                    <v-icon left>
                                        mdi-television-guide
                                    </v-icon>
                                    Own Classes
                                </v-tab>

                                <v-tab-item>
                                    <v-card-text style="height: 90%; overflow-x: scroll;">
                                        <v-row v-if="filterEnrolledClassItems == undefined  && typeof filterEnrolledClassItems != 'object'">
                                            <v-col
                                                    v-for="idx in 9"
                                                    cols="6"
                                                    md="4"
                                            >
                                                <v-card
                                                        outlined
                                                        class="mx-auto"
                                                        style="width: 500px; height: 400px; justify-content: center"
                                                        align="center"
                                                >
                                                    <v-skeleton-loader
                                                            ref="skeleton"
                                                            type="card"
                                                            class="mx-auto"
                                                    >
                                                    </v-skeleton-loader>
                                                </v-card>
                                            </v-col>
                                        </v-row>

                                        <v-row v-else-if="filterEnrolledClassItems == null">
                                            수강완료및 수강중인 클래스가 없습니다.
                                        </v-row>

                                        <v-row v-else-if="filterEnrolledClassItems.length> 0">
                                            <v-col v-for="(clazz, index) in filterEnrolledClassItems" :key="index"
                                                   xl="4"
                                                   lg="4"
                                                   md="6"
                                                   sm="12">
                                                <class-card :clazz="clazz"></class-card>
                                            </v-col>
                                        </v-row>

                                    </v-card-text>
                                </v-tab-item>
                                <v-tab-item>
                                    <v-card-text style="height: 90%; overflow-x: scroll;">
                                        <v-row v-if="filterOwnClassItems == undefined  && typeof filterOwnClassItems != 'object'">
                                            <v-col
                                                    v-for="idx in 9"
                                                    cols="6"
                                                    md="4"
                                            >
                                                <v-card
                                                        outlined
                                                        class="mx-auto"
                                                        style="width: 500px; height: 400px; justify-content: center"
                                                        align="center"
                                                >
                                                    <v-skeleton-loader
                                                            ref="skeleton"
                                                            type="card"
                                                            class="mx-auto"
                                                    >
                                                    </v-skeleton-loader>
                                                </v-card>
                                            </v-col>
                                        </v-row>

                                        <v-row v-else-if="filterOwnClassItems == null">
                                            강의중인 클래스가 없습니다.
                                        </v-row>

                                        <v-row v-else-if="filterOwnClassItems.length > 0">
                                            <v-col v-for="(clazz, index) in filterOwnClassItems" :key="index"
                                                   xl="4"
                                                   lg="4"
                                                   md="6"
                                                   sm="12">
                                                <class-card :clazz="clazz"></class-card>
                                            </v-col>
                                        </v-row>
                                        <v-row v-else>
                                            강의중인 클래스가 없습니다.
                                        </v-row>
                                    </v-card-text>
                                </v-tab-item>
                            </v-tabs>
                        </v-card-text>
                    </v-tab-item>

                    <v-tab-item>

                        <v-card-text style="height: 100%; overflow-x: scroll;">
                            <v-row v-if="filterCertificateItems == undefined  && typeof filterCertificateItems != 'object'">
                                <v-col
                                        v-for="idx in 9"
                                        cols="6"
                                        md="4"
                                >
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 500px; height: 400px; justify-content: center"
                                            align="center"
                                    >
                                        <v-skeleton-loader
                                                ref="skeleton"
                                                type="list-item-two-line"
                                                class="mx-auto"
                                        >
                                        </v-skeleton-loader>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-row v-else-if="filterCertificateItems == null">
                                발급된 증명서가 없습니다.
                            </v-row>

                            <v-row v-else-if="filterCertificateItems.length > 0">
                                <v-col
                                        v-for="(certificate,index) in filterCertificateItems" :key="index"
                                        md="6"
                                        sm="12">

                                    <v-card
                                            flat
                                            style="justify-content: center"
                                            align="center"
                                    >
                                        <FirstCertificate :information="certificate"></FirstCertificate>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>

                        <!--                        <v-card-text style="height: 100%; overflow-x: scroll;">-->
                        <!--                            <v-row v-if="filterCerti == undefined  && typeof filterCerti != 'object'">-->
                        <!--                                <v-col-->
                        <!--                                        v-for="idx in 9"-->
                        <!--                                        cols="6"-->
                        <!--                                        md="4"-->
                        <!--                                >-->
                        <!--                                    <v-card-->
                        <!--                                            outlined-->
                        <!--                                            class="mx-auto"-->
                        <!--                                            style="width: 500px; height: 400px; justify-content: center"-->
                        <!--                                            align="center"-->
                        <!--                                    >-->
                        <!--                                        <v-skeleton-loader-->
                        <!--                                                ref="skeleton"-->
                        <!--                                                type="list-item-two-line"-->
                        <!--                                                class="mx-auto"-->
                        <!--                                        >-->
                        <!--                                        </v-skeleton-loader>-->
                        <!--                                    </v-card>-->
                        <!--                                </v-col>-->
                        <!--                            </v-row>-->

                        <!--                            <v-row v-else-if="filterCerti == null">-->
                        <!--                                발급된 증명서가 없습니다.-->
                        <!--                            </v-row>-->

                        <!--                            <v-row v-else-if="filterCerti.length > 0">-->
                        <!--                                <v-col v-for="(certificate,index) in filterCerti" :key="index"-->
                        <!--                                       md="6"-->
                        <!--                                       sm="12">-->
                        <!--                                    <v-card flat-->
                        <!--                                            style="justify-content: center"-->
                        <!--                                            align="center"-->
                        <!--                                    >-->
                        <!--                                        <v-card-text>-->
                        <!--                                            <div style="width: 100%; height: 100%;">-->
                        <!--                                                <FirstCertificate :information="certificate"></FirstCertificate>-->
                        <!--                                            </div>-->
                        <!--                                        </v-card-text>-->
                        <!--                                    </v-card>-->
                        <!--                                </v-col>-->
                        <!--                            </v-row>-->
                        <!--                        </v-card-text>-->
                    </v-tab-item>
                </v-tabs>
            </div>
        </v-row>
    </div>
</template>

<script>
    import ListPages from "../ListPages";
    import ClassCard from "../labs/ClassCard";
    import FirstCertificate from "../certificates/FirstCertificate";
    import EventStormingListCard from "../listPages/EventStormingListCard";

    export default {
        name: 'personal-info',
        mixins: [ListPages],
        components: {ClassCard, FirstCertificate, EventStormingListCard},
        props: {
            userInformation: {
                type: Object,
                default: function () {
                    return null;
                }
            },
            edit: {
                type: Boolean,
                default: function () {
                    return false;
                }
            }
        },
        data() {
            return {
                // standardRow: 9,
                modelingItems: undefined,
                enrolledClassItems: undefined,
                ownClassItems: undefined,
                certificateItems: undefined,
                tmpCerti: undefined
            }
        },
        created() {
            this.setPersonalInfo()
            this.setModelingInfo()
            this.setClazzInfo()
            this.setCertificates()
            // this.setTmpCertificates()

        },
        computed: {
            getPersonalInfo() {
                return this.userInfo
            },
            filterModelingItems() {
                var me = this
                if (me.modelingItems) {
                    me.modelingItems.forEach(function (item) {
                        if (!item.author) {
                            item.author = me.userInfo.uid
                            item.authorProfile = me.userInfo.profile
                            item.authorName = me.userInfo.name
                        }
                    })

                    return me.modelingItems.sort(function (a, b) {
                        if(b.lastModifiedTimeStamp && a.lastModifiedTimeStamp){
                            return b.lastModifiedTimeStamp - a.lastModifiedTimeStamp
                        }else {
                            return b.lastModifiedDate - a.lastModifiedDate;
                        }
                    });
                }
                return me.modelingItems
            },
            filterEnrolledClassItems() {
                return this.enrolledClassItems
            },
            filterOwnClassItems() {
                return this.ownClassItems
            },
            filterCertificateItems() {
                return this.certificateItems
            },
            filterCerti() {
                return this.tmpCerti
            }

        },
        mounted() {
        },
        methods: {
            async setPersonalInfo() {
                var me = this
                var getUid = null
                var getProfile = null
                var getName = null
                var getEmail = null

                if (me.userInformation) {
                    getUid = me.userInformation.author
                    getProfile = me.userInformation.authorProfile
                    getName = me.userInformation.authorName
                } else {
                    getUid = me.$route.params.userUid ? me.$route.params.userUid : localStorage.getItem('uid')
                }

                if (!getProfile || !getName) {
                    var getUserInfo = await me.getString(`db://users/${getUid}`)
                    getProfile = getUserInfo.profile_picture
                    getName = getUserInfo.username
                    getEmail = getUserInfo.email
                }
                me.userInfo.uid = getUid
                me.userInfo.profile = getProfile
                me.userInfo.name = getName
                me.userInfo.email = getEmail
            },
            async setModelingInfo() {
                var me = this
                await me.setPersonalInfo()

                var option = {
                    sort: "desc",
                    orderBy: 'author',
                    size: null,
                    startAt: `${me.userInfo.uid}`,
                    endAt: `${me.userInfo.uid}`,
                }
                var mineList = await me._getArrayAndSnapByPath(`db://userLists/everyone/share`, option)
                me.modelingItems = mineList ? mineList.returnArray : []
            },
            async setClazzInfo() {
                var me = this
                var convertEmail = null
                await me.setPersonalInfo()

                if (me.userInfo.email) {
                    convertEmail = me.userInfo.email.replace(/\./gi, '_')
                    var existEnrolledClass = await this.list(`db://enrolledUsers/${convertEmail}/enrolledClass`)

                    if (existEnrolledClass) {
                        me.watchArrayByPath(`db://enrolledUsers/${convertEmail}/enrolledClass`, 'snapshots', async function (item) {
                            var courseName = item.key.split('@')[0]
                            var clazzName = item.key.split('@')[2]
                            var clazz = await me.getObject(`storage://labs-msaez.io/running/${courseName}/classes/${clazzName}/Class_Metadata.json`)
                            if (clazz) {
                                clazz.thumbnail = await me.getThumbnailImg(clazz)
                                if (!me.enrolledClassItems) me.enrolledClassItems = []
                                me.enrolledClassItems.push(clazz)
                            }
                        })
                    } else {
                        me.enrolledClassItems = null
                    }


                    var existOwnClass = await this.list(`db://enrolledUsers/${convertEmail}/ownClasses`)

                    if (existOwnClass) {
                        me.watchArrayByPath(`db://enrolledUsers/${convertEmail}/ownClasses`, 'snapshots', async function (item) {
                            var courseName = item.key.split('@')[0]
                            var clazzName = item.key.split('@')[2]
                            var clazz = await me.getObject(`storage://labs-msaez.io/running/${courseName}/classes/${clazzName}/Class_Metadata.json`)
                            if (clazz) {
                                clazz.thumbnail = await me.getThumbnailImg(clazz)
                                if (!me.ownClassItems) me.ownClassItems = []
                                me.ownClassItems.push(clazz)
                            }
                        })
                    } else {
                        me.ownClassItems = null
                    }
                }
            },
            async setCertificates() {
                var me = this
                var convertEmail = null
                await me.setPersonalInfo()

                if (me.userInfo.email) {
                    convertEmail = me.userInfo.email.replace(/\./gi, '_')
                    var existCertificates = await this.list(`db://enrolledUsers/${convertEmail}/certificates`)

                    if (existCertificates) {
                        me.watchArrayByPath(`db://enrolledUsers/${convertEmail}/certificates`, 'snapshots', async function (item) {
                            if (item) {
                                var getResource = item.resourceId
                                var getResourcePath = getResource.replace(/\@/gi, '/')
                                if (!me.certificateItems) me.certificateItems = []
                                me.certificateItems.push(item)
                            }

                        })
                    } else {
                        me.certificateItems = null
                    }
                }
            },
            async setTmpCertificates() {
                var me = this
                var existCertificates = await this.list(`db://certificates`)
                if (existCertificates) {
                    Object.keys(existCertificates).forEach(function (key) {
                        var certi = arraykeys[key]
                        if (certi) {
                            if (!me.tmpCerti) me.tmpCerti = []
                            me.tmpCerti.push(certi)
                        }

                    })

                }
            },
            async getThumbnailImg(clazz) {
                var me = this
                if (clazz.thumbnail)
                    return clazz.thumbnail

                var thumbnailImg = null
                var existPath = await me.list(`storage://labs-msaez.io/running/${clazz.courseId}/classes/${clazz.classId.replace("@", "/")}/`)

                if (existPath) {
                    var path = existPath.find(x => x.name && ((x.name.includes('.png') || x.name.includes('.jpg'))))
                    if (path) {
                        thumbnailImg = await this.getImageURL(`storage://labs-msaez.io/running/${path}`)
                        return thumbnailImg
                    }
                }
                thumbnailImg = await this.getImageURL(`storage://labs-msaez.io/running/${clazz.courseId}/default.png`)
                return thumbnailImg
            },
            maskingName(strName) {
                if (strName.length > 2) {
                    var originName = strName.split('');
                    originName.forEach(function (name, i) {
                        if (i === 0 || i === originName.length - 1) return;
                        originName[i] = '*';
                    });
                    var joinName = originName.join();
                    return joinName.replace(/,/g, '');
                } else {
                    var pattern = /.$/; // 정규식
                    return strName.replace(pattern, '*');
                }
            },
        },
    }
</script>

<style>
</style>
