<template>
    <div>
        <v-card flat ref="certificationInfo">
            <v-card-title>
                <h2>사용자 서티 발급</h2>
            </v-card-title>
            <div style="width: 100%;">
                <v-text-field
                        v-model="certificateUserLists"
                        label="사용자 이메일 (, 으로 구분 합니다.)"
                        style="width:100%;"
                        :rules="rules.required"
                ></v-text-field>
            </div>
            <div>
                <v-text-field
                        v-model="certificateInfo.url"
                        label="강의 경로(URL) ex) http://msaez.io/#/courses/../../.."
                        style="width:90%;"
                        :rules="rules.required"
                ></v-text-field>
                <v-row style="place-items: center;width: fit-content;" v-if="certificateInfo.url">
                    <v-text-field
                            v-model="urlInfo.course"
                            label="코스이름"
                            style="width:20%;"
                    ></v-text-field>
                    <v-text-field
                            v-model="urlInfo.clazz"
                            label="클래스 이름"
                            style="width:20%;"
                    ></v-text-field>
                    <v-text-field
                            v-model="urlInfo.lab"
                            label="랩이름"
                            style="width:20%;"
                    ></v-text-field>
                </v-row>
            </div>
            <div style="border: outset; padding: 10px;">
                <v-text-field
                        v-model="certificateInfo.title"
                        label="강의 제목"
                        :rules="rules.required"
                        style="width:80%;"
                ></v-text-field>
                <v-text-field
                        v-model="certificateInfo.subTitle"
                        label="강의 부제"
                        style="width:70%;"
                ></v-text-field>
                <v-row>
                    <v-col>
                        <v-text-field
                                v-model="certificateInfo.when"
                                label="발급일자(yyyy-mm-dd)"
                                :rules="rules.required"
                                style="width:100%;"
                        ></v-text-field>
                        <v-text-field
                                v-model="certificateInfo.expiredPeriod"
                                label="만료기간( 00 일) 기본: 90일/ 무제한: 0"
                                style="width:100%;"
                        ></v-text-field>
                    </v-col>
                    <v-text-field
                            v-model="certificateInfo.teacher"
                            label="발급자(Publisher)"
                            :rules="rules.required"
                            style="width:10%; margin-top: 16px;margin-right: 47px;"
                    ></v-text-field>
                </v-row>
            </div>
            <v-card-actions style="justify-content: flex-end;">
                <v-btn color="primary" @click="issueCertificate()"> 발급</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>
<script>
    import StorageBase from "../designer/modeling/StorageBase";
    export default {
        name: 'issue-certificate',
        mixins: [StorageBase],
        components: {},
        props: {},
        data() {
            return {
                certificateUserLists: null,
                certificateInfo: {
                    url: null,
                    title: null,
                    subTitle: null,
                    when: null,
                    expiredPeriod: null,
                    teacher: null,
                },
                urlInfo: {
                    clazz: null,
                    course: null,
                    lab: null,
                },
                rules: {
                    required: [value => !!value || "Required."]
                }
            }
        },
        methods:{
            initCertificateInfo() {
                this.certificateUserLists = null
                this.certificateInfo.title = null
                this.certificateInfo.subTitle = null
                this.certificateInfo.when = null
                this.certificateInfo.url = null
                this.certificateInfo.expiredPeriod = null
                this.certificateInfo.teacher = null

            },
            issueCertificate() {
                var me = this
                var setArray = null
                var setCertificateInfo = {}
                try {
                    if (me.certificateUserLists) {
                        var getArray = me.certificateUserLists
                        getArray = getArray.replace(/\s/gi, "")
                        getArray = getArray.split(',')
                        setArray = getArray
                    }
                    if (setArray) {
                        if (me.certificateInfo.url) {
                            setCertificateInfo.url = me.certificateInfo.url

                            if (me.certificateInfo.title) {
                                setCertificateInfo.title = me.certificateInfo.title

                                if (me.certificateInfo.when) {
                                    var myDate = me.certificateInfo.when

                                    myDate = myDate.split("-");
                                    var newDate = new Date(myDate[0], myDate[1] - 1, myDate[2]);
                                    setCertificateInfo.when = newDate.getTime()

                                    if (me.certificateInfo.teacher) {
                                        setCertificateInfo.teacher = me.certificateInfo.teacher
                                    } else {
                                        alert('발급자 입력하세요.')
                                        return false
                                    }

                                    if (me.certificateInfo.expiredPeriod && me.certificateInfo.expiredPeriod < 181) {
                                        setCertificateInfo.expiredPeriod = Number(me.certificateInfo.expiredPeriod)
                                    } else {
                                        if (me.certificateInfo.expiredPeriod == 0) {
                                            setCertificateInfo.expiredPeriod = 0
                                        } else {
                                            setCertificateInfo.expiredPeriod = 90
                                        }

                                    }
                                } else {
                                    alert('발급날 입력해주세요')
                                    return false
                                }
                            } else {
                                alert('Title을 입력해주세요.')
                                return false
                            }
                        } else {
                            alert('url을 입력해주세요')
                            return false
                        }

                        if (this.urlInfo.course && this.urlInfo.clazz) {
                            var itemId = `${this.urlInfo.course}@${this.urlInfo.clazz}`
                            if (this.urlInfo.lab) {
                                itemId = itemId + `@${this.urlInfo.lab}`
                            }
                            var obj = {
                                'className': setCertificateInfo.title,
                                'itemId': itemId,
                                'period': setCertificateInfo.expiredPeriod,
                                'resourceId': itemId,
                                'teacherId': setCertificateInfo.teacher,
                                'when': setCertificateInfo.when,

                            }
                            var totalLen = setArray.length
                            setArray.forEach(async function (email, index) {
                                if (email) {
                                    var convertEmail = email.replace(/\./gi, '_')
                                    var userName = await me.getString(`db://enrolledUsers/${convertEmail}/userName`)
                                    obj.userName = userName
                                    await me.pushString(`db://enrolledUsers/${convertEmail}/certificates`, obj)
                                    // await me.pushString(`db://enrolledUsers/${convertEmail}/certificates`, obj)
                                }
                                if (index == totalLen - 1) {
                                    me.initCertificateInfo()
                                    alert('발급 완료 되었습니다.')
                                }
                            })
                        } else {
                            alert('course 및 class 를 입력해주세요')
                            return false
                        }
                    } else {
                        alert('사용자를 입력해주세요')
                        return false
                    }


                } catch (e) {
                    console.log(e)
                    alert(e)
                }
            },
        }
    }

</script>