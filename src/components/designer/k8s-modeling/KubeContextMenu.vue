<template>
    <div>
        <ul
            :id="elementId"
            class="vue-simple-context-menu"
            v-click-outside="onClickOutside"
        >
            <li
                v-for="(option, index) in options"
                :key="index"
                @click="optionClicked(option)"
                class="vue-simple-context-menu__item"
                :class="[option.class, (option.type === 'divider' ? 'vue-simple-context-menu__divider' : '')]"
            >
                <span v-html="option.name"></span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <v-btn
                        icon style="margin-left: auto;"
                        @click.stop="beforeCommandCopy(option)"
                        v-if="option.name != 'Terminal Open'"
                >
                    <v-icon small>mdi-content-copy</v-icon>
                </v-btn>
            </li>
        </ul>
    </div>
</template>

<script>
    import VueSimpleContextMenu from 'vue-simple-context-menu'

    export default {
        mixins: [VueSimpleContextMenu],
        name: 'vue-context-menu',
        props: {
        },
        data () {
            return {
                isCopy: false,
            }
        },
        methods: {
            beforeCommandCopy(option) {
                this.isCopy = true;
                this.$emit('option-clicked', {
                    item: this.item,
                    option: option,
                    isCopy: this.isCopy
                });
            }
        }
    }
</script>

<style lang="scss">
$light-grey: #ecf0f1;
$grey: darken($light-grey, 15%);
$blue: #007aff;
$white: #fff;
$black: #333;

.v-application ul, .v-application ol {
    padding: 0;
}

.vue-simple-context-menu {
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    display: none;
    list-style: none;
    position: absolute;
    z-index: 1000000;
    background-color: $light-grey;
    border-bottom-width: 0px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
    box-shadow: 0 3px 6px 0 rgba($black, 0.2);
    border-radius: 4px;

    &--active {
        display: block;
    }

    &__item {
        display: flex;
        color: $black;
        cursor: pointer;
        padding: 5px 5px 5px 15px;
        align-items: center;

        &:hover {
            background-color: $blue;
            color: $white;
        }
    }

    &__divider {
        box-sizing: content-box;
        height: 2px;
        background-color: $grey;
        padding: 4px 0;
        background-clip: content-box;
        pointer-events: none;
    }

    // Have to use the element so we can make use of `first-of-type` and
    // `last-of-type`
    li {
        &:first-of-type {
        margin-top: 4px;
        }

        &:last-of-type {
        margin-bottom: 4px;
        }
    }
}
</style>
