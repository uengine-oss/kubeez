<template>
    <v-card>
        <v-tabs vertical>
            <v-tab>
                <v-icon left>
                    mdi-content-paste
                </v-icon>
                구매 관리
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-account-circle-outline
                </v-icon>
                개인정보
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-barcode
                </v-icon>
                쿠폰 관리
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-message-draw
                </v-icon>
                서티 발급
            </v-tab>

            <!-- 구매 관리-->
            <v-tab-item>
                <div style="width: 90%;">
                    <div>
                        <v-card flat>
                            <v-card-title>
                                <h2>개인사용자 구매/사용 목록</h2>
                                <v-spacer></v-spacer>
                                <v-row style="align-items:center; justify-content: flex-end;">
                                    <div v-if="subscription" style="margin-right: 15px; width: 35%;">
                                        <v-card>
                                            <v-card-title>
                                                <v-row style="place-content: space-between; margin-left: 0px;">
                                                    구독: {{subscription.type}}
                                                    <v-btn v-if="isExtendedSubscription" small color="primary"
                                                           @click="subscriptionItem()">연장
                                                    </v-btn>
                                                </v-row>
                                            </v-card-title>
                                            <v-divider></v-divider>
                                            <v-card-text>
                                                <v-row>
                                                    <v-col style="text-align: start;">
                                                        <div style="font-size: 16px;">* 구매 일자</div>
                                                        <div style="font-size: 16px; margin-left: 5px;">
                                                            {{_convertTimeStampToDate(subscription.issuedDate)}}
                                                        </div>
                                                        <div style="font-size: 16px;">* 만료 일자</div>
                                                        <div style="font-size: 16px;margin-left: 5px;">
                                                            {{_convertTimeStampToDate(subscription.expiredDate)}}
                                                        </div>
                                                    </v-col>
                                                    <v-col style="text-align: start;">
                                                        <div style="font-size: 16px;">* 잔여 IDE 시간</div>
                                                        <div style="font-size: 16px;margin-left: 5px; font-size: 18px; color: black;">
                                                            {{subscriptionIdeTime}} 분
                                                        </div>
                                                        <div style="font-size: 16px;">* 잔여 수강랩</div>
                                                        <div style="font-size: 16px;margin-left: 5px;font-size: 18px; color: black;">
                                                            {{subscription.availableLabs}} 회
                                                        </div>
                                                    </v-col>
                                                </v-row>
                                            </v-card-text>
                                        </v-card>
                                    </div>
                                    <div style="font-size: small;">개인 유저 이메일</div>
                                    <v-text-field
                                            v-model="findUser.email"
                                            label="Input individual email"
                                            @keydown.enter="getPurchaseHistoryLists(findUser.email)"
                                            style="max-width: 300px; margin-left: 30px;"
                                    ></v-text-field>
                                    <v-text-field
                                            v-model="filterSavedCoin"
                                            label="Coin"
                                            disabled
                                            style="max-width: 10%; margin-left: 30px;"
                                    ></v-text-field>
                                    <v-text-field
                                            v-model="filterSavedTool"
                                            label="Tool Time(분)"
                                            disabled
                                            style="max-width: 10%; margin-left: 30px;"
                                    ></v-text-field>
                                </v-row>

                            </v-card-title>
                            <v-data-table
                                    v-if="personPurchaseItemLists"
                                    :headers="personPurchaseItemHeaders"
                                    :items="personPurchaseItemLists"
                                    :items-per-page="standardRow"
                                    :page="getNowPage"
                                    class="elevation-1"
                                    hide-default-footer
                                    :loading="personLoading"
                                    loading-text="Loading... Please wait"
                            >
                                <template v-slot:item.itemId="{ item }">
                                    <div :style="convertItemIdToStyle(item)"> {{ convertItemIdToText(item) }}</div>
                                </template>
                                <template v-slot:item.getRelatedName="{ item }">
                                    <div :style="convertItemIdToStyle(item)"> {{item.getRelatedName}}</div>
                                </template>
                                <template v-slot:item.amount="{ item }">
                                    <v-row style="place-content: flex-end;">
                                        <div :style="convertActionToStyle(item)">{{ convertAmountToText(item) }}</div>
                                    </v-row>
                                </template>
                                <template v-slot:item.issuedDate="{ item }">
                                    {{ convertStartToText(item) }}
                                </template>
                                <template v-slot:item.expiredDate="{ item }">
                                    {{ convertEndToText(item) }}
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-icon
                                            :key="item.key"
                                            v-if="item.copy"
                                            small
                                            class="mr-2"
                                            @click="copyKey(item)"
                                    > mdi-check
                                    </v-icon>
                                    <v-icon
                                            :key="item.key"
                                            v-else
                                            small
                                            class="mr-2"
                                            @click="copyKey(item)"
                                    >mdi-content-copy
                                    </v-icon>
                                </template>
                            </v-data-table>
                            <v-card-actions style="justify-content: flex-end;">
                                <div style="margin-right: 10px;">전체 {{personTotalRow}} 건</div>
                                <v-icon @click="prevPagination()">mdi-chevron-left</v-icon>
                                <v-icon @click="nextPagination()">mdi-chevron-right</v-icon>
                            </v-card-actions>
                        </v-card>
                    </div>


                    <div>
                        <v-card flat>
                            <v-card-title>
                                <h2>전체사용자 구매/사용 목록</h2>
                                <v-spacer></v-spacer>
                                <v-text-field
                                        v-model="adminPurchaseItemSearch"
                                        append-icon="mdi-magnify"
                                        label="사용자 or 개인구매번호 "
                                        single-line
                                        hide-details
                                        style="width:20%;"
                                        @keydown.enter="adminFindItemList()"
                                ></v-text-field>
                            </v-card-title>
                            <v-data-table
                                    v-if="adminPurchaseItemLists"
                                    :headers="filterAdminPurchaseItemHeaders"
                                    :items="adminPurchaseItemLists"
                                    :items-per-page="standardRow"
                                    :page="getNowPageOfAll"
                                    class="elevation-1"
                                    hide-default-footer
                                    :loading="adminLoading"
                                    loading-text="Loading... Please wait"
                            >

                                <template v-slot:item.historyId="{ item }">
                                    <div style="width:80%;"> {{item.key}}</div>
                                </template>
                                <template v-slot:item.userId="{ item }">
                                    {{ convertUserIdToText(item) }}
                                </template>
                                <template v-slot:item.itemId="{ item }">
                                    <div :style="convertItemIdToStyle(item)"> {{ convertItemIdToText(item) }}</div>
                                </template>
                                <template v-slot:item.getRelatedName="{ item }">
                                    <div :style="convertItemIdToStyle(item)"> {{item.getRelatedName}}</div>
                                </template>
                                <template v-slot:item.amount="{ item }">
                                    <div :style="convertActionToStyle(item)">{{ convertAmountToText(item) }}</div>
                                </template>
                                <template v-slot:item.issuedDate="{ item }">
                                    <div style="text-align: -webkit-center;">
                                        <div style="width: 60px;">
                                            {{ convertStartToText(item) }}
                                        </div>
                                    </div>
                                </template>
                                <template v-slot:item.expiredDate="{ item }">
                                    <div style="text-align: -webkit-center;">
                                        <div style="width: 60px;">
                                            {{ convertEndToText(item) }}
                                        </div>
                                    </div>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <div v-if="refundAble(item)">
                                        {{refundToText(item)}}
                                        <v-btn color="error" x-small @click="refundItem(item)">
                                            취소하기
                                        </v-btn>
                                    </div>
                                    <div v-else style="text-align: -webkit-center;">
                                        <div style="width: 60px;">
                                            {{refundToText(item)}}
                                        </div>
                                    </div>
                                </template>
                            </v-data-table>
                            <v-card-actions style="justify-content: flex-end;">
                                <div style="margin-right: 10px;">전체 {{adminTotalRow}} 건</div>
                                <v-icon @click="prevPagination('all')">mdi-chevron-left</v-icon>
                                <v-icon @click="nextPagination('all')">mdi-chevron-right</v-icon>
                            </v-card-actions>
                        </v-card>
                    </div>
                </div>
            </v-tab-item>

            <v-tab-item>
                <div style="width: 90%;">
                    <PersonalInfo></PersonalInfo>
                </div>
            </v-tab-item>


            <v-tab-item>
                <div style="width: 90%;">
                    <v-card flat>
                        <v-card-title>
                            <h2>코인 쿠폰 목록</h2>
                            <v-row style="align-items:center; margin-left: 50px;">
                                <div style="font-size: small;">쿠폰 발행</div>
                                <v-text-field
                                        v-model="couponValue"
                                        label="Input Coin Value"
                                        @keydown.enter="registerCoupon()"
                                        style="max-width: 10%; margin-left: 20px;"
                                ></v-text-field>
                            </v-row>

                        </v-card-title>
                        <v-data-table
                                v-if="couponItemLists"
                                :headers="couponHeaders"
                                :items="couponItemLists"
                                :items-per-page="standardRow"
                                :page="getNowPageOfCoupon"
                                class="elevation-1"
                                hide-default-footer
                                :loading="couponLoading"
                                loading-text="Loading... Please wait"
                        >
                            <template v-slot:item.used="{ item }">
                                <div :style="convertActionToStyle(item)">{{ (item && item.used) ? "Y": 'N' }}</div>
                            </template>
                            <template v-slot:item.usedDate="{ item }">
                                {{ convertStartToText(item)}}
                            </template>
                            <template v-slot:item.issuedDate="{ item }">
                                {{ convertStartToText(item)}}
                            </template>
                        </v-data-table>
                        <v-card-actions style="justify-content: flex-end;">
                            <div style="margin-right: 10px;">전체 {{couponTotalRow}} 건</div>
                            <v-icon @click="prevPagination('coupon')">mdi-chevron-left</v-icon>
                            <v-icon @click="nextPagination('coupon')">mdi-chevron-right</v-icon>
                        </v-card-actions>
                    </v-card>
                </div>
            </v-tab-item>

            <v-tab-item>
                <div style="width: 50%;">
                    <IssueCertificate></IssueCertificate>
                </div>
            </v-tab-item>

        </v-tabs>
    </v-card>
</template>

<script>
    import MyPage from "./MyPage";
    import PersonalInfo from "./PersonalInfo";
    import IssueCertificate from "./IssueCertificate";

    export default {
        name: 'admin-my-page',
        mixins: [MyPage],
        components: {PersonalInfo, IssueCertificate},
        props: {},
        data() {
            return {
                inputDate: '',
                outputDate: '',
            }
        },
        computed: {},
        async created() {
            if (!this.isLogin)
                await this.loginUser()

            this.checkSubscription()
            this.getCouponLists()
            this.getPurchaseHistoryLists()
            this.getAllPurchaseHistoryLists()
        },
        mounted() {
        },
        watch: {
            'inputDate': function (newVal) {
                this.outputDate = this.getPartialExpiredDate(newVal)
            },
            "certificateInfo.url":
                _.debounce(
                    function (newVal) {
                        if (newVal) {
                            var splitUrl = newVal.split('/courses/')[1].split('/')
                            this.urlInfo.course = splitUrl[0] ? splitUrl[0] : null
                            this.urlInfo.clazz = splitUrl[1].split('@') ? splitUrl[1].split('@')[1] : null
                            this.urlInfo.lab = splitUrl[2] ? splitUrl[2] : null
                        }
                    }, 500
                ),
        },
        methods: {
            getPartialExpiredDate(issuedTimeStamp) {
                var today = Date.now()
                var expiredDate = issuedTimeStamp

                if (issuedTimeStamp) {
                    if (typeof issuedTimeStamp == 'string') issuedTimeStamp = Number(issuedTimeStamp)
                    var issuedDate = new Date(issuedTimeStamp);
                    var todayDate = new Date(today);
                    var period = 1

                    for (period = 1; period < 13; period++) {
                        //issued 달
                        let thisMonthFirstDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1, todayDate.getHours(), todayDate.getMinutes());
                        // month달 후의 1일
                        let addMonthFirstDate = new Date(issuedDate.getFullYear(), issuedDate.getMonth() + period, 1, issuedDate.getHours(), issuedDate.getMinutes());
                        // month달 후의 말일
                        let addMonthLastDate = new Date(issuedDate.getFullYear(), issuedDate.getMonth() + period + 1, 0, issuedDate.getHours(), issuedDate.getMinutes());

                        expiredDate = addMonthFirstDate;

                        if (thisMonthFirstDate.getTime() <= issuedTimeStamp && issuedTimeStamp < addMonthFirstDate.getTime()) {
                            if (issuedDate.getDate() > addMonthLastDate.getDate()) {
                                expiredDate.setDate(addMonthLastDate.getDate());
                            } else {
                                expiredDate.setDate(issuedDate.getDate());
                            }
                            break;
                        } else if (addMonthFirstDate.getTime() <= today && today <= addMonthLastDate.getTime()) {
                            if (todayDate.getDate() > issuedDate.getDate()) {
                                addMonthFirstDate = new Date(addMonthFirstDate.getFullYear(), issuedDate.getMonth() + period + 1, 1, addMonthFirstDate.getHours(), addMonthFirstDate.getMinutes());
                                // month달 후의 말일
                                addMonthLastDate = new Date(addMonthFirstDate.getFullYear(), issuedDate.getMonth() + period + 2, 0, addMonthFirstDate.getHours(), addMonthFirstDate.getMinutes());
                                expiredDate = addMonthFirstDate;
                            }

                            if (issuedDate.getDate() > addMonthLastDate.getDate()) {
                                expiredDate.setDate(addMonthLastDate.getDate());
                            } else {
                                expiredDate.setDate(issuedDate.getDate());
                            }
                            break;
                        }

                    }

                    return this.convertTimeStampToDate(expiredDate.getTime())
                }
                return null
            },
            convertTimeStampToDate(getTimeStamp) {
                var timeStamp = null
                if (getTimeStamp) {
                    timeStamp = getTimeStamp
                } else {
                    timeStamp = Date.now()
                }

                if (timeStamp) {
                    if (typeof timeStamp == 'string')
                        timeStamp = Number(timeStamp)
                    var date = new Date(timeStamp);
                    var year = date.getFullYear().toString().slice(-2)
                    var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
                    var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
                    var hour = ("0" + date.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
                    var minute = ("0" + date.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
                    var second = ("0" + date.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)

                    return year + "." + month + "." + day + ' ' + hour + ":" + minute + ':' + second
                }

            },
            async getPurchaseHistoryLists(email) {
                var me = this
                try {
                    me.personLoading = true

                    if (!email) {
                        email = me.userInfo.email
                        me.setAuthor(email)
                    }


                    if (me.findUser.email) {
                        var convertEmail = me.findUser.email.replace(/\./gi, '_')
                        if (!me.personPurchaseItemData) me.personPurchaseItemData = []

                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: me.standardRow,
                            startAt: null,
                            endAt: null,
                        }
                        var returnObj = await me._getSnapAndArrayByPath(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`, option)
                        if (returnObj.returnArray) {
                            returnObj.returnArray.forEach(function (item) {
                                item.getRelatedName = null
                            })
                            me.personPurchaseItemData = returnObj.returnArray
                            me.personTotalRow = Object.keys(returnObj.snapshot).length
                            me.personTotalPage = Math.ceil(me.personTotalRow / me.standardRow)
                        } else {
                            this.personPurchaseItemData = null
                            me.personTotalRow = 0
                            me.personTotalPage = 1
                        }

                    }
                    me.getFindUserCoin()
                    me.personLoading = false
                } catch (e) {
                    alert(e)
                }
            },
            async getAllPurchaseHistoryLists() {
                var me = this
                try {
                    me.adminLoading = true
                    if (!me.adminPurchaseItemData) me.adminPurchaseItemData = []

                    var option = {
                        sort: "desc",
                        orderBy: null,
                        size: me.standardRow,
                        startAt: null,
                        endAt: null,
                    }
                    var returnObj = await me._getSnapAndArrayByPath(`db://purchaseItemHistoryLists`, option)

                    returnObj.returnArray.forEach(function (item) {
                        item.getRelatedName = null
                    })

                    me.adminPurchaseItemData = returnObj.returnArray

                    me.adminTotalRow = Object.keys(returnObj.snapshot).length
                    me.adminTotalPage = Math.ceil(me.adminTotalRow / me.standardRow)
                    me.adminLoading = false
                } catch (e) {
                    alert(e)
                }
            },
            async getCouponLists() {
                var me = this
                try {
                    me.couponLoading = true
                    if (!me.couponItemData) me.couponItemData = []

                    var option = {
                        sort: "desc",
                        orderBy: null,
                        size: me.standardRow,
                        startAt: null,
                        endAt: null,
                    }
                    var returnObj = await me._getSnapAndArrayByPath(`db://coupons`, option)

                    me.couponItemData = returnObj.returnArray
                    me.couponTotalRow = Object.keys(returnObj.snapshot).length
                    me.couponTotalPage = Math.ceil(me.couponTotalRow / me.standardRow)
                    me.couponLoading = false
                } catch (e) {

                }
            },
            async registerCoupon() {
                var me = this
                try {
                    if (typeof me.couponValue != 'number') me.couponValue = Number(me.couponValue)

                    var IssueEmail = me.userInfo.email
                    var obj = {
                        resourceType: 'coin',
                        paymentType: 'coupon',
                        used: false,
                        amount: me.couponValue,
                        issuedUser: IssueEmail,
                        issuedDate: Date.now()
                    }

                    // var key = await me.pushString(`db://coupon`, obj)
                    var key = await me.pushObject(`db://coupons`, obj)
                    me.couponValue = 0
                    alert('쿠폰 ' + key + ' (가) 추가 되었습니다.')
                } catch (e) {
                    alert(e)
                }
            },
            async adminFindItemList() {
                var me = this

                try {
                    me.adminLoading = true
                    if (me.adminPurchaseItemSearch) {
                        var option = null
                        me.adminPurchaseItemData = []

                        if (me.adminPurchaseItemSearch.includes('@')) {
                            var newId = me.adminPurchaseItemSearch.replace(/\./gi, '_')
                            option = {
                                sort: "desc",
                                orderBy: 'userId',
                                size: null,
                                startAt: `${newId}`,
                                endAt: `${newId}\uf8ff`,
                            }
                            var returnObj = await me._getSnapAndArrayByPath(`db://purchaseItemHistoryLists`, option)
                            if (returnObj && returnObj.returnArray) {
                                returnObj.returnArray.forEach(function (item) {
                                    item.getRelatedName = null
                                })
                                me.adminPurchaseItemData = returnObj.returnArray
                                me.adminTotalRow = returnObj.returnArray.length
                            } else {
                                me.adminPurchaseItemData = []
                                me.adminTotalRow = 1
                            }
                            me.adminTotalPage = Math.ceil(me.adminTotalRow / me.standardRow)
                            me.adminSortActive = true
                        } else {
                            var returnObj = await me.getObject(`db://purchaseItemHistoryLists/${me.adminPurchaseItemSearch}`)
                            returnObj.getRelatedName = null
                            returnObj.key = me.adminPurchaseItemSearch
                            me.adminPurchaseItemData.push(returnObj)
                            me.adminTotalRow = 1
                            me.adminTotalPage = 1
                            me.adminSortActive = true
                        }

                    } else {
                        me.adminSortActive = false
                        me.getAllPurchaseHistoryLists()
                    }

                    me.adminLoading = false
                } catch (e) {
                    alert(e)
                }
            },

        },
    }
</script>

<style>
</style>