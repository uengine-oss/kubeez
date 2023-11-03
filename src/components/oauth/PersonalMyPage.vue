<template>
    <div style="width: 90%;">
        <v-card flat>
            <v-tabs vertical>

                <v-tab>
                    <div>
                        <v-icon left>
                            mdi-content-paste
                        </v-icon>
                        {{$t('myPage.purchaseManagement')}}
                    </div>
                </v-tab>

                <v-tab style="justify-content: left;">
                    <div>
                        <v-icon left>
                            mdi-account-circle-outline
                        </v-icon>
                        {{$t('myPage.privacy')}}
                    </div>
                </v-tab>

                <v-tab-item>
                    <v-card-title>
                        <h2> {{$t('myPage.purchaseList')}}</h2>
                        <v-spacer></v-spacer>
                        <v-row style="align-items:center; justify-content: flex-end;">
                            <div v-if="subscription" style="margin-right: 15px; width: 35%;">
                                <v-card>
                                    <v-card-title>
                                        <v-row style="place-content: space-between; margin-left: 0px;">
                                            {{$t('word.subscription')}}: {{subscription.type}}
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
                            {{ convertItemIdToText(item) }}
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
                </v-tab-item>

                <v-tab-item>
                    <PersonalInfo></PersonalInfo>
                </v-tab-item>


            </v-tabs>

        </v-card>
    </div>
</template>

<script>
    import MyPage from "./MyPage";
    import PersonalInfo from "./PersonalInfo";

    export default {
        name: 'personal-my-page',
        mixins: [MyPage],
        components: {PersonalInfo},
        props: {},
        data() {
            return {}
        },
        computed: {},
        async created() {
            var me = this
            if (!this.isLogin)
                await this.loginUser()

            me.checkSubscription()
            me.getPurchaseHistoryLists()
            me.getFindUserCoin()
        },
        mounted() {
        },
        methods: {
            async getPurchaseHistoryLists() {
                var me = this
                try {
                    me.personLoading = true
                    if (me.isLogin) {
                        if (!me.personPurchaseItemData) me.personPurchaseItemData = []
                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: me.standardRow,
                            startAt: null,
                            endAt: null,
                        }
                        var returnObj = await me._getSnapAndArrayByPath(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`, option)

                        if (returnObj.returnArray && returnObj.returnArray.length > 0) {
                            returnObj.returnArray.forEach(function (item) {
                                item.getRelatedName = null
                            })
                        }
                        me.personPurchaseItemData = returnObj.returnArray ? returnObj.returnArray : null
                        me.personTotalRow = returnObj.snapshot ? Object.keys(returnObj.snapshot).length : 1
                        me.personTotalPage = Math.ceil(me.personTotalRow / me.standardRow)
                    }
                    me.personLoading = false
                } catch (e) {

                }

            },
        },
    }
</script>

<style>
</style>

<!--"myPage": {-->
<!--"purchaseManagement": "Purchase Management",-->
<!--"privacy": "Privacy",-->
<!--"couponManagement": "Coupon Management",-->
<!--"certification": "Certification",-->
<!--"purchaseList": "Individual Buy/Use List",-->
<!--"issuedDate": "Issued Date",-->
<!--"expiredDate": "Expired Date",-->
<!--"remainIDE": "Remain IDE time",-->
<!--"remainLab": "Remain available Lab",-->
<!--"individualEmail": "Individual Email"-->
<!--}-->