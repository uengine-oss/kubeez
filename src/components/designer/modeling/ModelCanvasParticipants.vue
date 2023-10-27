<template>
    <v-card>
        <v-card-text>
            <v-simple-table dense height="270px">
                <template v-slot:default>
                    <tbody v-for="item in inviteLists">
                    <tr v-if="item">
                        <td>
                            <!-- user Profile 존재시  -->
                            <v-avatar v-if="item.userPic" size="36">
                                <img
                                        :src="item.userPic"
                                >
                            </v-avatar>
                            <!-- user 기본 이미지  -->
                            <v-avatar v-else size="36">
                                <v-icon>mdi-account-circle</v-icon>
                            </v-avatar>
                        </td>

                        <td class="text-center">
                            <v-col align="start" style="padding-top:10px;">
                                <v-row style="place-items:center;">
                                    <div> {{item.userName}}</div>
                                    <v-chip v-if="item.request == true || item.request == false" small
                                            style="color: dodgerblue;">공유요청
                                    </v-chip>
                                </v-row>
                                <div style="margin:5px  0 0 -11px;">{{ item.email }}</div>
                            </v-col>
                        </td>
                        <td class="text-center">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">

                                    <div v-if="item.request == true || item.request == false">
                                        <v-btn
                                                color="primary"
                                                v-on="on"
                                                @click="acceptRequest(item)"
                                                small
                                        >
                                            수락
                                        </v-btn>
                                    </div>
                                    <div v-else>
                                        <v-btn v-if="item.write"
                                               :disabled="item.userName == 'Everyone'"
                                               text
                                               v-on="on"
                                               @click="item.write = false"
                                        >
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn v-else
                                               text
                                               v-on="on"
                                               :disabled="item.userName == 'Everyone'"
                                               @click="item.write = true">
                                            <v-icon>mdi-eye</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span v-if="item.write">{{$t('permission.write')}}</span>
                                <span v-else>{{$t('permission.read')}}</span>
                            </v-tooltip>
                        </td>
                        <td class="text-rigth">
                            <v-btn small text
                                   @click="remove(item)">
                                <v-icon small> mdi-close</v-icon>
                            </v-btn>
                        </td>
                    </tr>
                    </tbody>
                </template>
            </v-simple-table>

            <v-row dense style="height: 40px;" >
                <v-text-field
                        v-model="inviteUser.email"
                        label="User to invite"
                        :error-messages="getCallbackMsg"
                        @keydown.enter="add()"
                ></v-text-field>
                <v-select
                        :append-icon="shareIconTypes"
                        v-model="inviteUser.permission"
                        @keydown.enter="add()"
                        :items="permissionTypes"
                        reverse
                        style="width:10px;"
                ></v-select>
                <v-btn
                        small text :style="getPlusStyle"
                        @click="add()">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-row>
            <v-row dense style="height: 5px; margin-top:15px;">
                <v-checkbox v-model="all" @click="sharedAll()" label='share everyone'></v-checkbox>
            </v-row>
        </v-card-text>

        <v-card-actions style="justify-content: flex-end;">
            <v-btn text @click="close()">Close</v-btn>
            <v-btn color="primary" text @click="apply()">Apply</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    const _ = require('lodash');

    export default {
        name: 'model-canvas-participants',
        components: {},
        props: {
            value: {
                type: Object,
                default: function () {
                    return null
                },
            },
            checkPublic: {
                type: Boolean,
                default: function () {
                    return false
                },
            },
        },
        data() {
            return {
                plusEff: false,
                all: false,
                inviteUser: {
                    email: null,
                    permission: 'Write'
                },
                permissionTypes: ['ReadOnly', 'Write'],
                shareComment: '',
                callbackMsg: null,
                copyValue: null,
            }
        },
        watch: {
            "inviteUser.email":
                _.debounce(
                    function (newVal) {
                        var me = this
                        var email = newVal
                        if (email && email.length > 3 && email.includes('@gmail.com')) {
                            me.plusEff = true
                        } else {
                            me.plusEff = false
                        }

                    }, 100
                ),
            'checkPublic': function (newVal) {
                this.all = newVal
            },
            "showDialog": function (open) {
                if (open) {
                    this.copyValue = JSON.parse(JSON.stringify(this.value))
                }
            },
        },
        computed: {
            getCallbackMsg() {
                return this.callbackMsg
            },
            getPlusStyle() {
                if (this.plusEff) {
                    return 'margin-top: 13px; color:dodgerblue; '
                }
                return 'margin-top: 13px;'
            },
            getInviteUser() {
                var copyInviteUser = JSON.parse(JSON.stringify(this.inviteUser))
                if (copyInviteUser.email) {
                    copyInviteUser.email = copyInviteUser.email.trim()
                    return copyInviteUser
                }
                return null;

            },
            inviteLists() {
                return this.value
            },
            shareIconTypes() {
                var me = this
                if (me.inviteUser.permission == 'ReadOnly') {
                    return 'mdi-eye'
                } else {
                    return 'mdi-pencil'
                }
            },
        },
        methods: {
            acceptRequest(user) {
                user.write = true
                user.request = null
            },
            sharedAll() {
                this.$emit('all', this.all)
            },
            apply() {
                this.$emit('apply', this.getInviteUser)
                this.inviteUser.email = null
            },
            close() {
                this.callbackMsg = null
                this.$emit('close', this.copyValue)
            },
            add() {
                if (this.getInviteUser) {
                    this.callbackMsg = null
                    this.$emit('add', this.getInviteUser)
                }
                this.inviteUser.email = null
            },
            remove(user) {
                this.$emit('remove', user)
            },
        },
        mounted() {
            var me = this

            me.$EventBus.$on('inviteCallBack', function (msgObj) {
                me.callbackMsg = msgObj.msg
            })
        }
    }
</script>