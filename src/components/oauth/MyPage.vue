<template>
    <div></div>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";

    export default {
        name: 'my-page',
        mixins: [CommonStorageBase],
        components: {},
        props: {},
        data() {
            return {
                findUser: {
                    email: null,
                    savedCoin: 0,
                    savedToolTime: 0
                },
                couponValue: 0,

                standardRow: 10,
                //pserson purchaseHistory
                personTotalRow: 0,
                personTotalPage: 1,
                personNowPage: 1,
                personLoading: false,

                //admin
                adminTotalRow: 0,
                adminTotalPage: 1,
                adminNowPage: 1,
                adminLoading: false,

                //coupon
                couponTotalRow: 0,
                couponTotalPage: 1,
                couponNowPage: 1,
                couponLoading: false,

                personPurchaseItemHeaders: [
                    {text: '사용 내역', sortable: false, value: 'itemId'},
                    {text: '사용 위치/상세 내역', sortable: false, value: 'getRelatedName'},
                    {text: '입/출금', sortable: false, align: 'end', value: 'amount'},
                    {text: '구매(시작) 일자', sortable: false, align: 'center', value: 'issuedDate'},
                    {text: '만료(종료) 일자', sortable: false, align: 'center', value: 'expiredDate'},
                    {text: null, sortable: false, align: 'center', value: 'actions'},
                ],
                personPurchaseItemData: null,

                adminPurchaseItemSearch: '',
                adminPurchaseItemHeaders: [
                    {text: '사용자', value: 'userId'},
                    {text: '구매 내역(리소스 번호)', sortable: false, value: 'itemId'},
                    {text: '사용 위치/상세 내역', sortable: false, value: 'getRelatedName'},
                    {text: '입/출금', sortable: false, align: 'end', value: 'amount'},
                    {text: '구매(시작) 일자', sortable: false, align: 'center', value: 'issuedDate'},
                    {text: '만료(종료) 일자', sortable: false, align: 'center', value: 'expiredDate'},
                    {text: '상태', sortable: false, align: 'center', value: 'actions'},
                ],
                adminPurchaseItemData: null,
                adminSortActive: false,


                couponHeaders: [
                    {
                        text: '쿠폰 번호',
                        align: 'start',
                        value: 'key',
                    },
                    {text: '코인금액', value: 'amount'},
                    {text: '사용 유저', value: 'usedUser'},
                    {text: '사용 유무', value: 'used'},
                    {text: '사용 일자', value: 'usedDate'},
                    {text: '발행자', value: 'issuedUser'},
                    {text: '발행일자', value: 'issuedDate'},
                ],
                couponItemData: null,
                //subscription
                subscription: null,
            }
        },
        computed: {
            subscriptionIdeTime() {
                if (this.subscription && this.subscription.ideTime) {
                    return this.subscription.ideTime.toFixed(2)
                }
                return 0
            },
            isExtendedSubscription() {
                var showDate = Date.now() + (5 * 24 * 60 * 60 * 1000)
                if (this.subscription && this.subscription.expiredDate > Date.now() && this.subscription.expiredDate < showDate) {
                    return true
                }
                return false
            },
            filterAdminPurchaseItemHeaders() {
                var me = this
                me.adminPurchaseItemHeaders.forEach(function (header) {
                    if (header) {
                        header.sortable = me.adminSortActive
                    }
                })

                return me.adminPurchaseItemHeaders

            },
            userAuthorized() {
                if (this.userInfo.authorized) {
                    return this.userInfo.authorized
                }
                return null
            },
            isAdmin() {
                if (this.userInfo.email && this.userInfo.email.includes('@uengine.org')) {
                    if (this.userAuthorized && this.userAuthorized == 'admin') {
                        return true
                    }
                }
                return false
            },
            personPurchaseItemLists() {
                var me = this
                if (me.personPurchaseItemData) {
                    me.personPurchaseItemData.forEach(async function (item) {
                        item.getRelatedName = await me.convertItemIdNameToText(item)
                    })

                    return this.personPurchaseItemData
                }
                return null
            },
            adminPurchaseItemLists() {
                var me = this
                if (me.adminPurchaseItemData) {
                    me.adminPurchaseItemData.forEach(async function (item) {
                        item.getRelatedName = await me.convertItemIdNameToText(item)
                    })
                    return me.adminPurchaseItemData
                }
                return null
            },
            couponItemLists() {
                if (this.couponItemData) {
                    return this.couponItemData
                }
                return null
            },
            filterSavedCoin() {
                if (this.findUser.savedCoin) {
                    return this._filterPrice(this.findUser.savedCoin)
                }
                return 0
            },
            filterSavedTool() {
                if (this.findUser.savedToolTime) {
                    return this.findUser.savedToolTime.toFixed(2)
                }
                return 0
            },
            getNowPage() {
                return this.personNowPage
            },
            getNowPageOfAll() {
                return this.adminNowPage
            },
            getNowPageOfCoupon() {
                return this.couponNowPage
            },
        },
        async created() {
            var me = this
            if (!this.isLogin)
                await this.loginUser()

            me.setAuthor(me.userInfo.email)
        },
        beforeDestroy() {
            var me = this
            if (me.findUser.email) {
                var convertEmail = me.findUser.email.replace(/\./gi, '_')
                me.watch_off(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`)
            }


        },
        methods: {
            async checkSubscription() {
                var me = this
                var convertEmail = me.findUser.email.replace(/\./gi, '_')
                me.subscription = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription`)
            },
            refundItem(item) {
                this.$EventBus.$emit('refundDialog', true, item)
            },
            subscriptionItem() {
                this.$EventBus.$emit('subscriptionDialog', true)
            },
            setAuthor(email) {
                this.findUser.email = email
            },
            async _getSnapAndArrayByPath(path, option) {
                var me = this
                try {
                    if (path) {
                        var totalSnap = await me.list(path)
                        var getArray = await me._getArrayByPath(path, option)
                        return {returnArray: getArray, snapshot: totalSnap}
                    }
                    return null
                } catch (e) {
                    return null
                    alert(e)
                }

            },
            async _getArrayByPath(path, option) {
                var me = this
                try {
                    var array = null
                    var snapshots = await me.list(path, option)

                    if (snapshots) {
                        snapshots.forEach(function (item, index) {
                            if (item) {
                                if (!array) array = []
                                item["copy"] = false
                                array.push(item)
                            }
                        })
                    }
                    return array
                } catch (e) {
                    alert(e)
                    return null
                }
            },
            _convertTimeStampToDate(timeStamp) {
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
                return '-'
            },
            filterPrice(item) {

                if (item.paymentType == 'pg') {
                    if (item.resourceType.includes('ide')) {

                        if (item.itemId == 'buy_ide') {
                            if (item.action == 'withdraw') {
                                return this._filterPrice(item.paidAmount)
                            }
                        } else {
                            if (item.action == 'deposit') {
                                return this._filterPrice(item.paidAmount)
                            }
                        }
                    } else {
                        return this._filterPrice(item.amount * 100)
                    }
                } else if (item.paymentType == 'coin') {
                    if (item.resourceType == 'ide') {
                        if (item.itemId == 'buy_ide') {
                            if (item.action == 'withdraw') {
                                return this._filterPrice(item.paidAmount)
                            }
                        } else {
                            if (item.action == 'deposit') {
                                return this._filterPrice(item.paidAmount)
                            }
                        }
                    }
                }
                return this._filterPrice(item.amount)
            },
            _filterPrice(amount) {
                if (typeof amount == 'string') amount = Number(amount)
                if (Number.isInteger(amount)) {
                    return amount
                }
                return Number(amount.toFixed(2))
            },
////
            async convertItemIdNameToText(item, isAdmin) {
                var me = this
                var text = ''


                if (item.resourceType.includes('ide')) {
                    if (item.itemId == 'buy_ide' || item.itemId == 'refund_ide') {
                        text = '-'
                    } else if (item.itemId == 'expired_subscription') {
                        text = `구독 만료:  ${item.amount.toFixed(2)} 분 소진`
                    } else {
                        if (item.className || item.labName) {
                            if (item.className) {
                                text = item.className
                            }
                            if (item.labName) {
                                text = `${text}( ${item.labName} )`
                            }
                        } else {
                            var isClass = false
                            var convertEmail = me.findUser.email.replace(/\./gi, '_')
                            if (item.itemId.includes('@')) {
                                isClass = true
                            }
                            if (isAdmin) {
                                convertEmail = item.userId.replace(/\./gi, '_')
                            }
                            if (isClass) {
                                text = await me.getString(`db://enrolledUsers/${convertEmail}/usage/${item.itemId}/className`)
                                if (!text) {
                                    text = item.itemId
                                }
                                text = `강의명 : '${text}' IDE 사용`
                            } else {
                                text = await me.getString(`db://definitions/${item.itemId}/information/projectName`)
                                if (text) {
                                    text = `모델명 : '${text}' IDE 사용`
                                } else {
                                    var localLists = await me.getObject(`localstorage://localLists`)
                                    var index = localLists.findIndex(info => info.projectId == item.itemId)
                                    if (index == -1) {
                                        text = `로컬 모델('${item.itemId}') IDE 사용`
                                    } else {
                                        text = `로컬 모델('${localLists[index].projectName}') IDE 사용`
                                    }
                                }

                                var getResourceType = item.resourceType
                                var ide = getResourceType
                                var ideDetail = {
                                    cpu: '2',
                                    memory: '4'
                                }
                                var tool = null
                                var toolDetail = {
                                    cpu: '2',
                                    memory: '4'
                                }
                                if (getResourceType.includes('@')) {
                                    ide = getResourceType.split('@')[0]
                                    tool = getResourceType.split('@')[1]
                                }


                                if (ide && ide.includes('-')) {
                                    ideDetail.cpu = ide.split('-')[1].split('m')[1].split('c')[0]
                                    ideDetail.memory = ide.split('-')[1].split('m')[0]
                                }

                                if (tool && tool.includes('-')) {
                                    toolDetail.cpu = tool.split('-')[1].split('m')[1].split('c')[0]
                                    toolDetail.memory = tool.split('-')[1].split('m')[0]
                                }

                                text = `${text}(CPU:${ideDetail.cpu} / MEMORY: ${ideDetail.memory}Gi/ UsedTime: ${((item.endBillingTime - item.startBillingTime) / (1000 * 60)).toFixed(2)}(분))`
                            }
                        }
                        text = `${text}`
                    }
                } else if (item.resourceType == 'class') {
                    text = `'${item.className}' 강의`
                } else if (item.resourceType == 'lab') {
                    if (item.itemId == 'expired_subscription') {
                        text = `구독 만료: ${item.amount}회 강의 소진`
                    } else {
                        text = `'${item.className}(${item.labName})' 강의`
                    }

                } else if (item.resourceType == 'downloadCode') {

                    if (item.itemId.includes('@')) {
                        text = `강의명: ${item.className}( ${item.labName} )`
                    } else {
                        var id = item.itemId.split('_')[1]
                        text = await me.getString(`db://definitions/${id}/information/projectName`)
                        if (text) {
                            text = `모델명 : '${text}' 사용`
                        } else {
                            var localLists = await me.getObject(`localstorage://localLists`)
                            var index = localLists.findIndex(info => info.projectId == id)
                            if (index == -1) {
                                text = `로컬 모델('${id}') 다운로드`
                            } else {
                                text = `로컬 모델('${localLists[index].projectName}') 다운로드`
                            }

                        }
                    }
                } else if (item.resourceType == 'coin') {

                } else if (item.resourceType.includes('subscription')) {
                    var getType = item.resourceType.split('-')[1]
                    text = `${getType} 구독형`
                } else if( item.resourceType.includes('video') ) {
                    if(item.className && item.labName){
                        text = `'${item.className}(${item.labName})'`
                    } else {
                        text = '강의자료'
                    }
                }


                if (item.refundedDate && (
                    (item.resourceType.includes('ide') && item.itemId.includes('refund'))
                    || (!item.resourceType.includes('ide') && item.action == 'deposit')
                )) {
                    if (text == '-') {
                        return `${text} 취소사유: ${item.refundedReason} (취소일시: ${me._convertTimeStampToDate(item.refundedDate)})`
                    } else {
                        return `${text} (취소일시: ${me._convertTimeStampToDate(item.refundedDate)})`
                    }
                } else {
                    return text
                }

            },
            convertItemIdToStyle(item) {
                if (item.refundedDate && (
                    (item.resourceType.includes('ide') && item.itemId.includes('buy'))
                    || (!item.resourceType.includes('ide') && !item.itemId.includes('buy') && item.action == 'withdraw')
                )) {
                    return 'width:100%; text-decoration-line: line-through;'
                }
                return 'width:100%;'
            },
            convertItemIdToText(item) {
                var text = ''

                if (item.action == 'deposit') {
                    if (item.resourceType.includes('ide')) {
                        if (item.itemId == 'buy_ide') {
                            text = `IDE 시간: ${item.amount} 분 `
                        } else if (item.itemId == 'refund_ide') {
                            text = `IDE 구매: ${item.amount} 분(환불)`
                        } else {
                            text = `IDE `
                        }
                    } else if (item.resourceType == 'class') {
                        text = `CLASS 환불`
                    } else if (item.resourceType == 'lab') {
                        text = `LAB 환불 `
                    } else if (item.resourceType == 'downloadCode') {
                        text = `코드다운로드`
                    } else if (item.resourceType == 'coin') {
                        if (item.itemId == 'gift_init') {
                            text = '가입 코인 지급'
                        } else if (item.paymentType == 'coupon') {
                            text = '쿠폰 코인 지급'
                        }
                    } else if(item.resourceType == 'video'){
                        if(item.itemId.includes('@')){
                            text = `${item.itemId.split('@')[0]} 환불`
                        }else{
                            text = '강의자료 환불'
                        }
                    }
                } else {
                    if (item.paymentType == 'subscription') {
                        if (item.resourceType.includes('ide')) {
                            if (item.itemId == 'expired_subscription') {
                                text = `IDE 사용 (구독 만료)`
                            } else {
                                text = `IDE 사용 (구독)`
                            }

                        } else if (item.resourceType == 'class') {
                            text = `CLASS 사용(구독)`
                        } else if (item.resourceType == 'lab') {
                            if (item.itemId == 'expired_subscription') {
                                text = `LAB 사용(구독 만료)`
                            }else{
                                text = `LAB 사용(구독)`
                            }

                        } else if (item.resourceType == 'downloadCode') {
                            text = `코드다운로드(구독)`
                        }
                    } else {
                        if (item.resourceType.includes('ide')) {
                            if (item.itemId == 'buy_ide') {
                                text = `IDE 구매: ${item.amount} 분 `
                            } else if (item.itemId == 'refund_ide') {
                                text = `IDE 시간: ${item.amount} 분(환불)`
                            } else {
                                text = `IDE 사용`
                            }
                        } else if (item.resourceType == 'class') {
                            text = `CLASS 구매`
                        } else if (item.resourceType == 'lab') {
                            text = `LAB 구매`
                        } else if (item.resourceType == 'downloadCode') {
                            text = `코드다운로드`
                        } else if (item.resourceType == 'coin') {
                            if (item.itemId == 'gift_init') {
                                text = '가입 코인 지급'
                            } else if (item.paymentType == 'coupon') {
                                text = '쿠폰 코인 지급'
                            }
                        } else if (item.resourceType.includes('subscription')) {
                            text = `구독 구매`
                        } else if(item.resourceType == 'video'){
                            if(item.itemId.includes('@')){
                                text = `${item.itemId.split('@')[0]} 구매`
                            }else{
                                text = '강의자료 구매'
                            }
                        }
                    }
                }
                return text
            },
            // convertItemIdToText(item) {
            //     var text = ''
            //     if (item.resourceType.includes('ide')) {
            //         if (item.itemId == 'buy_ide') {
            //             if (item.action == 'deposit') {
            //                 text = `IDE 시간 추가: ${item.amount} 분 `
            //             } else {
            //                 text = `IDE 구매: ${item.amount} 분 `
            //             }
            //         } else {
            //             if (item.className || item.labName) {
            //                 if (item.className) {
            //                     text = text + item.className
            //                 }
            //                 if (item.labName) {
            //                     text = `${text}( ${item.labName} )`
            //                 }
            //             } else {
            //                 if (!text) {
            //
            //                     text = `모델링 IDE(${item.itemId})`
            //                 }
            //             }
            //             text = `IDE 사용: "${text}" `
            //         }
            //     } else if (item.resourceType == 'class') {
            //         text = `LAB 구매: "${item.className}" 강의`
            //     } else if (item.resourceType == 'lab') {
            //         text = `LAB 구매: "${item.className}(${item.labName})" 강의`
            //     } else if (item.resourceType == 'downloadCode') {
            //         text = `코드다운로드: "${item.itemId}" `
            //     } else if (item.resourceType == 'coin') {
            //         if (item.itemId == 'gift_init') {
            //             text = '가입 코인 지급'
            //         } else if (item.paymentType == 'coupon') {
            //             text = '쿠폰 코인 지급'
            //         }
            //     }
            //     return text
            // },
            convertAmountToText(item) {
                var unit = ''
                // action:"withdraw"
                // amount:200
                // className:"[MSA School][CNA 강의] CNA 설계,개발,배포 실습"
                // copy:false
                // expiredDate:1632026380617
                // getRelatedName:"'[MSA School][CNA 강의] CNA 설계,개발,배포 실습([캡스톤프로젝트] 운영)' 강의"
                // issuedDate:1629440662384
                // itemId:"cna-full-msaschool@running@cna-full@capstone-deploy"
                // key:"-MhXDqGp5o8Yn2p57Xk6"
                // labName:"[캡스톤프로젝트] 운영"
                // paidAmount:0
                // paymentType:"subscription"
                // relatedTo:"-MhXDpgRgM24vGncieJf"
                // resourceType:"lab"

                if (item.paymentType.includes('ide')) {
                    unit = ' 분'
                } else if (item.paymentType == 'coin' || item.paymentType == 'gift') {
                    if (item.resourceType.includes('ide')) {
                        if (item.itemId == 'buy_ide') {
                            if (item.action == 'deposit') {
                                unit = ' 분'
                            } else {
                                unit = ' coin'
                            }
                        } else {
                            if (item.action == 'deposit') {
                                unit = ' coin'
                            } else {
                                unit = ' 분'
                            }
                        }
                    } else {
                        unit = ' coin'
                    }

                } else if (item.paymentType == 'pg') {
                    if (item.resourceType == 'ide') {
                        if (item.itemId == 'buy_ide') {
                            if (item.action == 'deposit') {
                                unit = ' 분'
                            } else {
                                unit = ' 원'
                            }
                        } else {
                            if (item.action == 'deposit') {
                                unit = ' 원'
                            } else {
                                unit = ' 분'
                            }
                        }
                    } else {
                        unit = ' 원'
                    }
                } else if (item.paymentType == 'coupon') {
                    if (item.resourceType == 'coin') {
                        unit = ' coin'
                    }
                } else if (item.paymentType == 'subscription') {

                    if (item.resourceType.includes('ide')) {
                        unit = ' 분'
                    } else {
                        unit = ' 회'
                    }
                } else {
                    unit = item.paymentType == 'pg' ? '원' : 'coin'
                }


                if (item.paymentType == 'subscription') {
                    if (item.itemId == 'expired_subscription') {
                        return `- ${this._filterPrice(item.amount)} ${unit}`
                    } else {
                        if (item.resourceType.includes('ide')) {
                            return `- ${this.filterPrice(item)} ${unit}`
                        } else {
                            return '- 1회'
                        }
                    }
                } else {
                    if (item.action == 'deposit') {
                        return `+ ${this.filterPrice(item)} ${unit}`
                    } else {
                        return `- ${this.filterPrice(item)} ${unit}`
                    }
                }

            },
            convertStartToText(item) {
                if (item.paymentType == 'ide' && item.resourceType.includes('ide')) {
                    return this._convertTimeStampToDate(item.startBillingTime)
                } else {
                    return this._convertTimeStampToDate(item.issuedDate)
                }

            },
            convertEndToText(item) {
                if (item.paymentType == 'ide' && item.resourceType.includes('ide')) {
                    var usedTime = item.endBillingTime - item.startBillingTime
                    usedTime = (usedTime / 1000) / 60
                    return `${this._convertTimeStampToDate(item.endBillingTime)}`
                } else {
                    if (item.resourceType.includes('ide')) {
                        return '-'
                    }
                    return this._convertTimeStampToDate(item.expiredDate)
                }
            },
            convertUserIdToText(item) {
                if (item && item.userId) {
                    return item.userId
                } else if (item.userEmail) {
                    return item.userEmail
                } else {
                    return null
                }
            },
            convertActionToStyle(item) {
                if (item && (item.action == 'deposit' || item.used == true)) {
                    return 'align-self:center; color: blue;font-size: medium; width: 140px;'
                }
                return 'align-self:center; color: red; font-size:medium;width: 140px;'
            },
            refundToTextColor(item) {
                if (item.refundedId && item.refundedDate) {
                    return 'width:60px; color: red;'
                }
                if (item.paymentType == 'coin') {
                    if (item.resourceType == 'ide') {
                        if (item.itemId == 'buy_ide' && item.action == 'withdraw') {
                            return 'width:60px; color: green;'
                        }
                    } else if (item.resourceType == "lab" || item.resourceType == "class") {
                        if (item.action == 'withdraw') {
                            return 'width:60px; color: green;'
                        }
                    } else if (item.resourceType == "downloadCode") {
                        return 'width:60px; color: green;'
                    }
                } else if (item.paymentType == 'pg') {
                    return 'width:60px; color: green;'
                }
            },
            refundToText(item) {
                if (item.refundedId && item.refundedDate) {
                    return '환불 완료'
                }
                if (item.paymentType == 'coin' || item.paymentType == 'pg') {
                    if (item.resourceType == 'ide') {
                        if (item.itemId == 'buy_ide' && item.action == 'withdraw') {
                            return '결제 완료'
                        }
                    } else if (item.resourceType == "lab" || item.resourceType == "class") {
                        if (item.action == 'withdraw') {
                            return '결제 완료'
                        }
                    } else if (item.resourceType == "downloadCode") {
                        return '결제 완료(환불 X)'
                    }
                }

            },
            refundAble(item) {
                if (item.refundedId && item.refundedDate) {
                    return false
                } else {
                    if (item.paymentType == 'pg' || item.paymentType == 'coin') {
                        if (item.resourceType == 'ide') {
                            if (item.itemId == 'buy_ide' && item.action == 'withdraw') {
                                return true
                            }
                        } else if (item.resourceType == "lab" || item.resourceType == "class") {
                            if (item.action == 'withdraw') {
                                return true
                            }
                        } else if (item.resourceType == "downloadCode") {
                            return false
                        }
                    }
                }

                return false
            },
            async getFindUserCoin() {
                var me = this

                try {
                    var convertEmail = me.findUser.email.replace(/\./gi, '_')
                    var getCoin = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/coin`)

                    if (getCoin) {
                        me.findUser.savedCoin = Number(getCoin)
                    } else {
                        me.findUser.savedCoin = 0
                    }

                    var getToolTime = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/ideTime`)

                    if (getToolTime) {
                        me.findUser.savedToolTime = Number(getToolTime)
                    } else {
                        me.findUser.savedToolTime = 0
                    }

                    var getConsultingTime = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/consultingTime`)

                    if (getConsultingTime) {
                        me.findUser.consultingTime = Number(getConsultingTime)
                    } else {
                        me.findUser.consultingTime = 0
                    }

                } catch (e) {

                }

            },
            // reversedChildren(snapshot) {
            //     try {
            //         var children = [];
            //         if (snapshot.key) {
            //             snapshot.forEach(function (child) {
            //                 var key = child.key
            //                 var item = child.val()
            //                 item.key = key
            //                 children.unshift(item);
            //             });
            //
            //
            //         } else if (typeof snapshot == 'object') {
            //             var keysArray = Object.keys(snapshot)
            //             var reverseKeys = keysArray.reverse()
            //             reverseKeys.forEach(function (key) {
            //                 var item = snapshot[key]
            //                 if (item) {
            //                     item.key = key
            //                     children.push(item)
            //                 }
            //             })
            //         }
            //
            //         return children;
            //     } catch (e) {
            //         return []
            //         alert(e)
            //     }
            // },
            copyKey(item) {
                const t = document.createElement("textarea");
                document.body.appendChild(t);
                t.value = item.key;
                t.select();
                document.execCommand('copy');
                document.body.removeChild(t);
                item.copy = true
                this.adminPurchaseItemSearch = JSON.parse(JSON.stringify(item.key))
                setTimeout(function () {
                    item.copy = false
                }, 3000)

            },
            prevPagination(type) {
                var me = this
                if (type == 'all') {
                    me.prevPageOfAllPurchaseHistory()
                } else if (type == 'coupon') {
                    me.prevPageOfCoupon()
                } else {
                    me.prevPageOfPurchaseHistory()
                }

            },
            prevPageOfAllPurchaseHistory() {
                var me = this
                var setPage = me.adminNowPage - 1
                if (setPage > 0)
                    me.adminNowPage = setPage
                else
                    me.adminNowPage = 1
            },
            prevPageOfPurchaseHistory() {
                var me = this
                var setPage = me.personNowPage - 1
                if (setPage > 0)
                    me.personNowPage = setPage
                else
                    me.personNowPage = 1
            },
            prevPageOfCoupon() {
                var me = this
                var setPage = me.couponNowPage - 1
                if (setPage > 0)
                    me.couponNowPage = setPage
                else
                    me.couponNowPage = 1
            },
            nextPagination(type) {
                var me = this
                if (type == 'all') {
                    me.nextPageOfAllPurchaseHistory()
                } else if (type == 'coupon') {
                    me.nextPageOfCoupon()
                } else {
                    me.nextPageOfPurchaseHistory()
                }

            },
            async nextPageOfAllPurchaseHistory() {
                var me = this
                try {
                    var nowTotalRow = me.adminPurchaseItemData.length
                    var openedPages = Math.ceil(nowTotalRow / me.standardRow)

                    // check last page
                    if (me.adminTotalPage <= me.adminNowPage) {
                        return true
                    }

                    // 열려있는 페이지 파악. 데이터 재로드 x
                    if (openedPages == me.adminTotalPage) {
                        me.adminNowPage = me.adminNowPage + 1
                        return true
                    }
                    nowTotalRow = nowTotalRow - 1
                    var lastKey = me.adminPurchaseItemData[nowTotalRow].key

                    if (lastKey) {
                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: me.standardRow + 1,
                            startAt: null,
                            endAt: lastKey
                        }

                        var returnArray = await me._getArrayByPath(`db://purchaseItemHistoryLists`, option)
                        if (lastKey == returnArray[0].key) {
                            returnArray.shift()
                        }
                        returnArray.forEach(function (item) {
                            item.getRelatedName = null
                            item.refundedId = item.refundedId ? item.refundedId : null
                            item.refundedDate = item.refundedDate ? item.refundedDate : null
                        })
                        me.adminPurchaseItemData = me.adminPurchaseItemData.concat(returnArray);
                    }
                    me.adminNowPage = me.adminNowPage + 1
                } catch (e) {
                    alert('nextPageOfAllPurchaseHistory: ', e)
                }
            },
            async nextPageOfPurchaseHistory() {
                var me = this

                try {
                    var nowTotalRow = me.personPurchaseItemData.length
                    var openedPages = Math.ceil(nowTotalRow / me.standardRow)

                    // check last page
                    if (me.personTotalPage <= me.personNowPage) {
                        return true
                    }

                    // 열려있는 페이지 파악. 데이터 재로드 x
                    if (openedPages == me.personTotalPage) {
                        me.personNowPage = me.personNowPage + 1
                        return true
                    }
                    nowTotalRow = nowTotalRow - 1
                    var lastKey = me.personPurchaseItemData[nowTotalRow].key

                    if (me.findUser.email && lastKey) {
                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: me.standardRow + 1,
                            startAt: null,
                            endAt: lastKey
                        }
                        var convertEmail = me.findUser.email.replace(/\./gi, '_')
                        var returnArray = await me._getArrayByPath(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`, option)
                        if (lastKey == returnArray[0].key) {
                            returnArray.shift()
                        }
                        returnArray.forEach(function (item) {
                            item.getRelatedName = null
                            item.refundedId = item.refundedId ? item.refundedId : null
                            item.refundedDate = item.refundedDate ? item.refundedDate : null
                        })
                        me.personPurchaseItemData = me.personPurchaseItemData.concat(returnArray);
                        me.personNowPage = me.personNowPage + 1
                    }
                } catch (e) {
                    alert('nextPageOfPurchaseHistory: ', e)
                }
            },
            async nextPageOfCoupon() {
                var me = this
                try {
                    var nowTotalRow = me.couponItemData.length
                    var openedPages = Math.ceil(nowTotalRow / me.standardRow)

                    // check last page
                    if (me.couponTotalPage <= me.couponNowPage) {
                        return true
                    }

                    // 열려있는 페이지 파악. 데이터 재로드 x
                    if (openedPages == me.couponTotalPage) {
                        me.couponNowPage = me.couponNowPage + 1
                        return true
                    }
                    nowTotalRow = nowTotalRow - 1
                    var lastKey = me.couponItemData[nowTotalRow].key

                    if (lastKey) {
                        var option = {
                            sort: "desc",
                            orderBy: null,
                            size: me.standardRow + 1,
                            startAt: null,
                            endAt: lastKey
                        }
                        var returnArray = await me._getArrayByPath(`db://coupons`, option)
                        if (lastKey == returnArray[0].key) {
                            returnArray.shift()
                        }

                        me.couponItemData = me.couponItemData.concat(returnArray);
                        me.couponNowPage = me.couponNowPage + 1
                    }
                } catch (e) {
                    alert('nextPageOfCoupon: ', e)
                }
            }
        },
    }
</script>

<style>
</style>