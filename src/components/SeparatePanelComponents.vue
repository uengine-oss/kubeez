<template>
    <div ref="splitPane" class="split-pane" :class="direction" :style="{ flexDirection: direction }">
        <div style="min-width:0px;" class="pane pane-one " :style="lengthType + ':' + paneLengthValue">
            <slot name="one"></slot>
        </div>

        <div
            :class="inBoundSeparatePanel ? 'in-bound-pane-trigger' : 'pane-trigger'"
            :style="lengthType + ':' + triggerLengthValue"
            @mousedown="handleMouseDown"
            v-if="paneLengthPercent < 99"
        >

            <v-tooltip v-if="!inBoundSeparatePanel" right>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  class="close-separate-panel-btn"
                            v-on="on"
                            outlined
                            x-small
                            icon
                            @click="closeSeparate()"
                            style="z-index: 3; margin-left: -6px; top: 50%; border: none; background-color:white"
                    >
                        <v-icon style="font-size: 22px;">mdi-play</v-icon>
                    </v-btn>
                </template>
                <span>Code Preview Close</span>
            </v-tooltip>
        </div>

        <div v-if="paneLengthPercent < 99" class="pane pane-two" style="min-width:0px;">
            <slot name="two"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name : 'separate-panel-components',
        props: {
            inBoundSeparatePanel: Boolean,
            direction: {
                type: String,
                default: 'row'
            },

            min: {
                type: Number,
                default: 0
            },

            max: {
                type: Number,
                default: 100
            },

            paneLengthPercent: {
                type: Number,
                default: 50
            },

            triggerLength: {
                type: Number,
                default: 5
            }
        },
        data() {
            return {
                triggerLeftOffset: 0, //        ( )
            }
        },
        computed: {
            lengthType() {
                return this.direction === 'row' ? 'width' : 'height'
            },

            paneLengthValue() {
                return `calc(${this.paneLengthPercent}% - ${this.triggerLength / 2 + 'px'})`
            },

            triggerLengthValue() {
                return this.triggerLength + 'px'
            }
        },
        mounted: function () {
        },

        methods: {
            closeSeparate(){
                this.$emit('close')
            },
            //
            handleMouseDown(e) {
                document.addEventListener('mousemove', this.handleMouseMove)
                document.addEventListener('mouseup', this.handleMouseUp)

                if (this.direction === 'row') {
                    this.triggerLeftOffset = e.pageX - e.srcElement.getBoundingClientRect().left
                } else {
                    this.triggerLeftOffset = e.pageY - e.srcElement.getBoundingClientRect().top
                }
            },

            //
            handleMouseMove(e) {
                const clientRect = this.$refs.splitPane.getBoundingClientRect()
                let paneLengthPercent = 0

                if (this.direction === 'row') {
                    const offset = e.pageX - clientRect.left - this.triggerLeftOffset + this.triggerLength / 2
                    paneLengthPercent = (offset / clientRect.width) * 100
                } else {
                    const offset = e.pageY - clientRect.top - this.triggerLeftOffset + this.triggerLength / 2
                    paneLengthPercent = (offset / clientRect.height) * 100
                }

                if (paneLengthPercent < this.min) {
                    paneLengthPercent = this.min
                }
                if (paneLengthPercent > this.max) {
                    paneLengthPercent = this.max
                }

                this.$emit('update:paneLengthPercent', paneLengthPercent)
            },

            //
            handleMouseUp() {
                document.removeEventListener('mousemove', this.handleMouseMove)
            }
        }
    }
</script>

<style scoped lang="scss">
    .split-pane {
        background: white;
        display: flex;
        &.row {
            .pane-trigger {
                cursor: col-resize;
            }
            .in-bound-pane-trigger {
                margin-top: 0px;
                cursor: col-resize;
            }
        }
        &.column {
            .pane {
                width: 100%;
            }
            .pane-trigger {
                width: 100%;
                cursor: row-resize;
            }
            .in-bound-pane-trigger {
                width: 100%;
                cursor: row-resize;
            }
        }
        .pane-one {
            // margin-left: 10px
            /*background: palevioletred;*/
        }
        .pane-trigger {
            user-select: none;
            background: lightgrey;
            position: relative;
        }
        .in-bound-pane-trigger {
            user-select: none;
            background: lightgrey;
            position: relative;
        }
        .pane-trigger:hover{
            user-select: none;
            background: grey;
            position: relative;
        }
        .in-bound-pane-trigger:hover{
            user-select: none;
            background: grey;
            position: relative;
        }
        .pane-two {
            flex: 1;
            /*background: turquoise;*/
        }
    }
</style>
<style>
    /* .code-preview-reaction-type {
        height:92vh !important;
        transform: 0.5;
    }
    @media only screen and (max-width:1746px) and (max-width:1601px) and (max-height:859px) and (max-height:757px),  (max-height:859px) {
        .code-preview-reaction-type {
            height:91vh !important;
        }
    }
    @media only screen and (max-width:1600px) and (max-width:1281px) and (max-height:756px) and (max-height:646px),  (max-height:756px)  {
        .code-preview-reaction-type {
            height:89vh !important;
        }
    }
    @media only screen and (max-width:1280px) and (max-width:1101px) and (max-height:645px) and (max-height:541px),  (max-height:645px)  {
        .code-preview-reaction-type {
            height:87vh !important;
        }
    }
    @media only screen and (max-width:1100px) and (max-width:961px) and (max-height:540px) and (max-height:481px),  (max-height:540px) {
        .code-preview-reaction-type {
            height:84vh !important;
        }
    }
    @media only screen and (max-width:960px) and (max-height:480px),  (max-height:480px) {
        .code-preview-reaction-type {
            height:80vh !important;
        }
    } */
</style>