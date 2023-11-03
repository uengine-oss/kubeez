<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width: 300px">
            <v-row align="center" justify="start" style="margin-left: 5px">
                ({{lists.length}})
                <div v-if="lists.length > 0 " v-for="(list,index) in lists">
                    {{list.userName }},
                </div>

                <v-row align="center" justify="end" style="margin-right: 10px">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon @click.native="close()">
                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                            </v-btn>
                        </template>
                        <span> {{$t('word.close')}} </span>
                    </v-tooltip>
                </v-row>
            </v-row>


            <div v-for="(participant,index) in participantLists">
                <v-card
                        class="mx-auto"
                        max-width="300"
                        outlined
                >
                    <v-list-item three-line>
                        <v-list-item-avatar
                                size="36"
                                color="grey"
                        >
                            <img
                                    :src=participant.picture
                                    :alt=participant.userName
                            >
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title>{{participant.userName}}</v-list-item-title>
                            <v-list-item-subtitle>{{participant.email}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-card>

            </div>


            <!--            <template v-slot:append>-->
            <!--                <v-container fluid v-for="chat in chatLists">-->
            <!--                    {{chat.userName}}:{{chat.inputText}}-->
            <!--                </v-container>-->

            <!--                <v-text-field-->
            <!--                        label="채팅하려면 여기에 내용을 입력하세요."-->
            <!--                        outlined-->
            <!--                ></v-text-field>-->
            <!--            </template>-->

        </v-navigation-drawer>

    </v-layout>

</template>

<script>
    export default {
        name: 'participant-panel',
        props: {
            lists: {
                type: Array,
                default: function () {
                    return []
                }
            },
        },
        computed: {
            participantLists() {
                return this.lists
            }
        },
        created(){
        },
        data() {
            return {}
        },
        methods: {
            close() {
                this.$EventBus.$emit('participantPanel', false)
            }
        }
    }
</script>