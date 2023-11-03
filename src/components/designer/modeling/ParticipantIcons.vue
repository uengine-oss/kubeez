<template>
    <v-layout>
        <v-row justify="end" align="center"
                id = "participant-lists">


            <div v-for="(participant,index) in participantLists" style="width: 30px;">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-avatar
                                v-if=" participantLists.length-8 == index "
                                size="40"
                        >
                            <v-icon> mdi-account-multiple</v-icon>
                        </v-avatar>

                        <v-avatar :style=" participantLists.length > 1 ? 'display:block;':'display:none;'"
                                v-if=" participantLists.length-7 <=  index && index < participantLists.length"
                                size="36"
                                v-on="on"
                        >
                            <img 
                                :src=participant.picture
                                :alt=participant.userName
                            >
                        </v-avatar>
                    </template>
                    <span>{{participant.userName }} {{participant.email}}</span>
                </v-tooltip>
            </div>

            <div style="margin-left: 10px">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-card :style=" participantLists.length >= 6 ? 'display:block;':'display:none;'"
                                style = "width:62px; padding:5px; margin-right:15px; font-size:14px;"
                            @click="openPanel()"
                            v-on="on"
                            color="indigo"
                            outlined
                        ><v-icon size="20"> mdi-account-multiple</v-icon>
                        공유
                        </v-card>
                    </template>
                    <span>Participant Lists</span>
                </v-tooltip>           
            </div>
        </v-row>
    </v-layout>
</template>

<script>
    export default {
        name: 'participant-icons',
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
        data() {
            return {}
        },
        methods: {
            openPanel() {
                this.$emit('openParticipantPanel', true)
            },
        }
    }
</script>

<style scoped>
    #participant-lists{
        position:absolute; 
        right:190px; 
        top:25px;
    }

    @media only screen and (max-width:810px){
        #participant-lists{
            display:none;
        }
    }
</style>