<template>
    <div>
        <slot v-if="canvas">

        </slot>
        <div class="canvas-wrapper">
            <div class="canvas-container" :id="id">
            </div>
        </div>
        <v-card style="position:relative; height: 200px">
            <v-card-text style="position:absolute" :id="sliderId">
            </v-card-text>
        </v-card>

    </div>
</template>

<script>
    var _ = require('lodash');
    export default {
        name: 'opengraph',
        props: {
            slider: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            sliderLocationScale: {
                default: function () {
                    return 1;
                },
                type: Number
            },
            /**
             * 캔버스 가로 (px)
             */
            width: {
                default: function () {
                    return 1000000;
                },
                type: Number
            },
            /**
             * 캔버스 세로 (px)
             */
            height: {
                default: function () {
                    return 1000000;
                },
                type: Number
            },
            /**
             * 캔버스 스케일(리얼 사이즈 : Scale = 1)
             */
            scale: {
                default: function () {
                    return 1;
                },
                type: Number
            },
            /**
             * 캔버스 최소 스케일
             */
            scaleMin: {
                default: function () {
                    return 0.1;
                },
                type: Number
            },
            /**
             * 캔버스 최대 스케일
             */
            scaleMax: {
                default: function () {
                    return 10;
                },
                type: Number
            },
            /**
             * 캔버스 배경색
             */
            backgroundColor: {
                default: function () {
                    return '#f9f9f9';
                },
                type: String
            },
            /**
             * 캔버스 배경이미지
             */
            backgroundImage: String,
            /**
             * 이미지 베이스 패스
             */
            imageBase: {
                default: function () {
                    return location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/';
                },
                type: String
            },
            /**
             * 풀, 래인 도형의 드랍시 자동 위치 조정 기능
             */
            poolDropEvent: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 도형, 스팟 이동시 이웃한 도형에 대해 자동보정이 이루어지는 여부.
             */
            automaticGuidance: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 선연결을 클릭하였을때만 변곡점 변경 가능 여부
             */
            spotOnSelect: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 자동 슬라이더 업데이트 여부
             */
            autoSliderUpdate: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 자동 히스토리 저장
             */
            autoHistory: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 마우스 휠 스케일 변경 여부
             */
            wheelScalable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 마우스 드래그 페이지 이동 가능 여부
             */
            dragPageMovable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 도형 선택시 캔버스 포거싱 여부
             */
            focusCanvasOnSelect: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 연결된 두 오브젝트의 소속에 따른 연결선 스타일 변화 여부
             */
            checkBridgeEdge: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 스틱 가이드 생성 여부
             */
            stickGuide: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 네비게이터 사용
             */
            navigator: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 클릭선택 가능여부
             */
            selectable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 마우스드래그선택 가능여부
             */
            dragSelectable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 이동 가능여부
             */
            movable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 리사이즈 가능여부
             */
            resizable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 연결 가능여부
             */
            connectable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * Self 연결 가능여부
             */
            selfConnectable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 가이드에 자기자신을 복사하는 컨트롤러 여부.
             */
            selfCloneable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 드래그하여 연결시 그룹을 건너뛸때 스타일 변경 여부
             */
            connectStyleChange: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 가이드에 삭제 컨트롤러 여부
             */
            deletable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 라벨 수정여부
             */
            labelEditable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 그룹핑 가능여부
             */
            groupDropable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 이동, 리사이즈 드래그시 MOVE_SNAP_SIZE 적용 여부
             */
            dragGridable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 핫키 가능여부
             */
            enableHotkey: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 핫키 : UNDO REDO 키 가능여부
             */
            enableHotkeyCtrlZ: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 핫키 : DELETE 삭제 키 가능여부
             */
            enableHotkeyDelete: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 핫키 : Ctrl+A 전체선택 키 가능여부
             */
            enableHotkeyCtrlA: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 핫키 : Ctrl+C 복사 키 가능여부
             */
            enableHotkeyCtrlC: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : Ctrl+V 붙여넣기 키 가능여부
             */
            enableHotkeyCtrlV: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : Ctrl+D 복제하기 키 가능여부
             */
            enableHotkeyCtrlD: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : Ctrl+G 그룹 키 가능여부
             */
            enableHotkeyCtrlG: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : Ctrl+U 언그룹 키 가능여부
             */
            enableHotkeyCtrlU: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : 방향키 가능여부
             */
            enableHotkeyArrow: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 핫키 : Shift + 방향키 가능여부
             */
            enableHotkeyShiftArrow: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 마우스 우클릭 메뉴 가능여부
             */
            enableContextmenu: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 루트 컨텍스트 메뉴 가능여부
             */
            enableRootContextmenu: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 도형 디폴트 스타일
             */
            defaultStyleShape: {
                default: function () {
                    return {
                        cursor: "default"
                    };
                },
                type: Object
            },
            /**
             * geometry 도형 디폴트 스타일
             */
            defaultStyleGeometry: {
                default: function () {
                    return {
                        stroke: "black",
                        "fill-r": ".5",
                        "fill-cx": ".5",
                        "fill-cy": ".5",
                        fill: "white",
                        "fill-opacity": 0,
                        "label-position": "center"
                    };
                },
                type: Object
            },
            /**
             * Text 도형 디폴트 스타일
             */
            defaultStyleText: {
                default: function () {
                    return {
                        stroke: "none", "text-anchor": "middle"
                    };
                },
                type: Object
            },
            /**
             * Html 도형 디폴트 스타일
             */
            defaultStyleHtml: {
                default: function () {
                    return {
                        "label-position": "bottom", "text-anchor": "middle", "vertical-align": "top"
                    };
                },
                type: Object
            },
            /**
             * Image 도형 디폴트 스타일
             */
            defaultStyleImage: {
                default: function () {
                    return {
                        "label-position": "bottom", "text-anchor": "middle", "vertical-align": "top"
                    };
                },
                type: Object
            },
            /**
             * Svg 도형 디폴트 스타일
             */
            defaultStyleSvg: {
                default: function () {
                    return {
                        "label-position": "bottom", "text-anchor": "middle", "vertical-align": "top"
                    };
                },
                type: Object
            },
            /**
             * Edge 도형 디폴트 스타일
             */
            defaultStyleEdge: {
                default: function () {
                    return {
                        stroke: "black",
                        fill: "none",
                        "fill-opacity": 0,
                        "stroke-width": 1.5,
                        "stroke-opacity": 1,
                        "edge-type": "plain",
                        "arrow-start": "none",
                        "arrow-end": "block",
                        "stroke-dasharray": "",
                        "label-position": "center",
                        "stroke-linejoin": "round",
                        cursor: "pointer"
                    };
                },
                type: Object
            },
            /**
             * Group 도형 디폴트 스타일
             */
            defaultStyleGroup: {
                default: function () {
                    return {
                        stroke: "black",
                        fill: "none",
                        "fill-opacity": 0,
                        "label-position": "bottom",
                        "text-anchor": "middle",
                        "vertical-align": "top"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 박스 디폴트 스타일
             */
            defaultStyleGuideBbox: {
                default: function () {
                    return {
                        stroke: "#00FF00",
                        fill: "white",
                        "fill-opacity": 0,
                        "stroke-dasharray": "- ",
                        "shape-rendering": "crispEdges",
                        cursor: "move"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 상단 좌측 스타일
             */
            defaultStyleGuideUl: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nwse-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 상단 우측 스타일
             */
            defaultStyleGuideUr: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 하단 좌측 스타일
             */
            defaultStyleGuideLl: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 하단 우측 스타일
             */
            defaultStyleGuideLr: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 좌측 센터 스타일
             */
            defaultStyleGuideLc: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 상단 센터 스타일
             */
            defaultStyleGuideUc: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 우측 센터 스타일
             */
            defaultStyleGuideRc: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 가이드 툴 하단 센터 스타일
             */
            defaultStyleGuideLwc: {
                default: function () {
                    return {
                        stroke: "#03689a",
                        fill: "#03689a",
                        "fill-opacity": 0.5,
                        cursor: "nesw-resize",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 도형 클론 가상 연결선 스타일
             */
            defaultStyleVirtualEdge: {
                default: function () {
                    return {
                        stroke: "black",
                        fill: "none",
                        "fill-opacity": 0,
                        "stroke-width": 1,
                        "stroke-opacity": 1,
                        "stroke-dasharray": "- ",
                        "stroke-linejoin": "round",
                        "arrow-start": "none",
                        "arrow-end": "none"
                    };
                },
                type: Object
            },
            /**
             * 화면 드래그 선택시 드래그 박스 스타일
             */
            defaultStyleRubberBand: {
                default: function () {
                    return {
                        stroke: "#0000FF",
                        opacity: 0.2,
                        fill: "#0077FF"
                    };
                },
                type: Object
            },
            /**
             * 그룹 드랍 가능시 그룹 박스 스타일
             */
            defaultStyleDropOverBbox: {
                default: function () {
                    return {
                        stroke: "#0077FF", fill: "none", opacity: 0.3, "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 라벨 디폴트 스타일
             */
            defaultStyleLabel: {
                default: function () {
                    return {
                        "font-size": 12, "font-color": "black", "fill": "none"
                    };
                },
                type: Object
            },
            /**
             * 연결 가능도형의 연결 테두리 스타일
             */
            defaultStyleConnectGuideBbox: {
                default: function () {
                    return {
                        stroke: "#00FF00",
                        fill: "none",
                        "stroke-dasharray": "- ",
                        "shape-rendering": "crispEdges"
                    };
                },
                type: Object
            },
            /**
             * 선연결 도형의 원형 Spot 스타일
             */
            defaultStyleConnectGuideSpotCircle: {
                default: function () {
                    return {
                        r: 7,
                        stroke: "#A6A6A6",
                        "stroke-width": 1,
                        fill: "#FFE400",
                        "fill-opacity": 0.5,
                        cursor: "pointer"
                    };
                },
                type: Object
            },
            /**
             * 선연결 도형의 사각형 Spot 스타일
             */
            defaultStyleConnectGuideSpotRect: {
                default: function () {
                    return {
                        stroke: "#A6A6A6",
                        "stroke-width": 1,
                        fill: "#FFE400",
                        "fill-opacity": 0.2,
                        cursor: "ns-resize",
                        w: 20,
                        h: 10
                    };
                },
                type: Object
            },
            /**
             * 연결가능 표현 하이라이트 스타일
             */
            defaultStyleConnectableHighlight: {
                default: function () {
                    return {
                        //"stroke-width": 2
                    };
                },
                type: Object
            }
        },

        data: function () {
            let id = this.uuid();
            let sliderId = id + '-slider';
            return {
                props: JSON.parse(JSON.stringify(this.$props)),
                id: id,
                sliderId: sliderId,
                canvas: null,
                elements: {},
                container: null,
                timerMap: {
                    renderingTime: {}
                },
            }
        },
        watch: {
            "canvas._CONFIG.SCALE": {
                handler: _.debounce(function (newVal) {
                    this.$emit('update:sliderLocationScale', newVal)
                }, 1000)
            },
            '$props': {
                handler: function (newVal, oldVal) {
                    this.props = JSON.parse(JSON.stringify(newVal))
                },
                deep: true
            },
            props: {
                handler: function (newVal, oldVal) {
                    var needToWatch = false;
                    for (var key in newVal) {
                        if (typeof newVal[key] == 'object') {
                            if (!oldVal[key] || JSON.stringify(newVal[key]) != JSON.stringify(oldVal[key])) {
                                // console.log(key, newVal[key], oldVal[key]);
                                needToWatch = true;
                            }
                        } else {
                            if (newVal[key] != oldVal[key]) {
                                needToWatch = true;
                                // console.log(key, newVal[key], oldVal[key]);
                            }
                        }
                    }
                    if (needToWatch && this.canvas) {
                        this.setCanvasConfiguration(this.canvas);
                    }
                },
                deep: true
            }
        },
        computed: {
            opengraphRole: function () {
                return 'canvas';
            },
            // scale: function () {
            //     console.log(this.canvas._CONFIG.SCALE)
            //     return this.canvas._CONFIG.SCALE
            // }
        },

        mounted: function () {
            this.render();
            this.bindEvents();

            var me = this;


            window.Vue.OGBus.$on('renderingTime', function (a, b) {
                if (!me.timerMap.renderingTime[a]) {
                    me.timerMap.renderingTime[a] = 0;
                }
                me.timerMap.renderingTime[a] += b;
            });
        },

        methods: {
            setCanvasConfiguration: function (canvas) {
                var me = this;

                canvas._CONTAINER = $(this.$el).find('.canvas-wrapper')[0];
                this.container = canvas._CONTAINER;

                //캔버스 스케일, 사이즈, 배경 관련.
                canvas._CONFIG.CANVAS_BACKGROUND = this.backgroundColor
                canvas._CONFIG.IMAGE_BASE = this.imageBase;
                canvas._CONFIG.SCALE_MIN = this.scaleMin;
                canvas._CONFIG.SCALE_MAX = this.scaleMax;
                $(canvas.getRootElement()).css({
                    "background-color": me.backgroundColor
                });
                if (me.backgroundImage) {
                    $(canvas.getRootElement()).css({"background-image": me.backgroundImage});
                }
                canvas.setCanvasSize([me.width, me.height]);
                //Drag On & Off 시, 캔버스 크기가 재조정되는 부분
                //        canvas.setScale(me.scale);

                //옵션 관련
                canvas._CONFIG.POOL_DROP_EVENT = this.poolDropEvent;
                canvas._CONFIG.AUTOMATIC_GUIDANCE = this.automaticGuidance;
                canvas._CONFIG.SPOT_ON_SELECT = this.spotOnSelect;
                canvas._CONFIG.AUTO_SLIDER_UPDATE = this.autoSliderUpdate;
                canvas._CONFIG.AUTO_HISTORY = this.autoHistory;
                canvas._CONFIG.WHEEL_SCALABLE = this.wheelScalable;
                canvas._CONFIG.DRAG_PAGE_MOVABLE = this.dragPageMovable;
                canvas._CONFIG.FOCUS_CANVAS_ONSELECT = this.focusCanvasOnSelect;
                canvas._CONFIG.CHECK_BRIDGE_EDGE = this.checkBridgeEdge;
                canvas._CONFIG.STICK_GUIDE = this.stickGuide;

                canvas._CONFIG.SELECTABLE = this.selectable;
                canvas._CONFIG.DRAG_SELECTABLE = this.dragSelectable;
                canvas._CONFIG.MOVABLE = this.movable;
                canvas._CONFIG.RESIZABLE = this.resizable;
                canvas._CONFIG.CONNECTABLE = this.connectable;
                canvas._CONFIG.SELF_CONNECTABLE = this.selfConnectable;
                canvas._CONFIG.CONNECT_CLONEABLE = this.selfCloneable;
                canvas._CONFIG.CONNECT_STYLE_CHANGE = this.connectStyleChange;
                // canvas._CONFIG.DELETABLE = this.deletable;
                canvas._CONFIG.LABEL_EDITABLE = this.labelEditable;
                canvas._CONFIG.GROUP_DROPABLE = this.groupDropable;
                canvas._CONFIG.DRAG_GRIDABLE = this.dragGridable;
                canvas._CONFIG.ENABLE_CONTEXTMENU = this.enableContextmenu;
                canvas._CONFIG.ENABLE_ROOT_CONTEXTMENU = this.enableRootContextmenu;
                canvas._CONFIG.ENABLE_HOTKEY = this.enableHotkey;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_Z = this.enableHotkeyCtrlZ;
                canvas._CONFIG.ENABLE_HOTKEY_DELETE = this.enableHotkeyDelete;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_A = this.enableHotkeyCtrlA;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_C = this.enableHotkeyCtrlC;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_V = this.enableHotkeyCtrlV;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_D = this.enableHotkeyCtrlD;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_G = this.enableHotkeyCtrlG;
                canvas._CONFIG.ENABLE_HOTKEY_CTRL_U = this.enableHotkeyCtrlU;
                canvas._CONFIG.ENABLE_HOTKEY_ARROW = this.enableHotkeyArrow;
                ;
                canvas._CONFIG.ENABLE_HOTKEY_SHIFT_ARROW = this.enableHotkeyShiftArrow;

                //디폴트 스타일 정의
                canvas._CONFIG.DEFAULT_STYLE.SHAPE = this.defaultStyleShape;
                canvas._CONFIG.DEFAULT_STYLE.GEOM = this.defaultStyleGeometry;
                canvas._CONFIG.DEFAULT_STYLE.TEXT = this.defaultStyleText;
                canvas._CONFIG.DEFAULT_STYLE.HTML = this.defaultStyleHtml;
                canvas._CONFIG.DEFAULT_STYLE.IMAGE = this.defaultStyleImage;
                canvas._CONFIG.DEFAULT_STYLE.SVG = this.defaultStyleSvg;
                canvas._CONFIG.DEFAULT_STYLE.EDGE = this.defaultStyleEdge;
                canvas._CONFIG.DEFAULT_STYLE.GROUP = this.defaultStyleGroup;

                canvas._CONFIG.DEFAULT_STYLE.GUIDE_BBOX = this.defaultStyleGuideBbox;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_UL = this.defaultStyleGuideUl;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_UR = this.defaultStyleGuideUr;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_LL = this.defaultStyleGuideLl;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_LR = this.defaultStyleGuideLr;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_LC = this.defaultStyleGuideLc;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_UC = this.defaultStyleGuideUc;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_RC = this.defaultStyleGuideRc;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_LWC = this.defaultStyleGuideLwc;
                canvas._CONFIG.DEFAULT_STYLE.GUIDE_VIRTUAL_EDGE = this.defaultStyleVirtualEdge;
                canvas._CONFIG.DEFAULT_STYLE.RUBBER_BAND = this.defaultStyleRubberBand;
                canvas._CONFIG.DEFAULT_STYLE.DROP_OVER_BBOX = this.defaultStyleDropOverBbox;
                canvas._CONFIG.DEFAULT_STYLE.LABEL = this.defaultStyleLabel;
                canvas._CONFIG.DEFAULT_STYLE.CONNECT_GUIDE_BBOX = this.defaultStyleConnectGuideBbox;
                canvas._CONFIG.DEFAULT_STYLE.CONNECT_GUIDE_SPOT_CIRCLE = this.defaultStyleConnectGuideSpotCircle;
                canvas._CONFIG.DEFAULT_STYLE.CONNECT_GUIDE_SPOT_RECT = JSON.parse(JSON.stringify(this.defaultStyleConnectGuideSpotRect));
                canvas._CONFIG.DEFAULT_STYLE.CONNECTABLE_HIGHLIGHT = this.defaultStyleConnectableHighlight;

                //줌 슬라이더
                if (!this.slider) {
                    canvas.removeSlider();
                } else {
                    // // console.log(this.canvas.)
                    // console.log(canvas._CONTAINER)
                    if (!canvas._CONFIG.SLIDER) {
                        canvas.addSlider({
                            slider: $("#" + this.sliderId),
                            left: 20,
                            width: 200,
                            height: 300,
                            sliderLocationScale: this.sliderLocationScale,
                            appendTo: "body",
                            position: {my: "bottom", at: "bottom", of: canvas._CONTAINER}
                        });
                        $("#" + this.sliderId).css("position", "absolute")
                    }
                }

            },
            getElementById: function (id) {
                return this.elements[id];
            },
            render: function () {
                var me = this;
                //컨테이너 변경
                OG.renderer.RaphaelRenderer.prototype.getContainer = function () {
                    return this._PAPER.canvas.parentNode.parentNode;
                };

                var canvas = new OG.Canvas(this.id, [this.width, this.height], this.backgroundColor,
                    this.backgroundImage ? 'url(' + this.backgroundImage + ')' : null);

                this.setCanvasConfiguration(canvas);
                canvas.initConfig({});
                this.canvas = canvas;
                this.$emit('canvasReady', this);
            },
            /**
             * 캔버스의 이벤트 핸들러 emit
             **/
            bindEvents: function () {
                var me = this;
                if (!me.canvas) {
                    return;
                }
                /**
                 * Shape 이 처음 Draw 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement)
                 */
                me.canvas.onDrawShape(function (event, shapeElement) {
                    me.$emit('drawShape', me.getElementById(shapeElement.id) || shapeElement);
                });

                /**
                 * History Update 되었을때의 이벤트 리스너 => Vue action 으로 표현.(사용자 action 에 의해 변경됨.)
                 *
                 * @param {Function} callbackFunc 콜백함수(event)
                 */
                me.canvas.onAddHistory(function (event) {
                    me.$ModelingBus.$emit('MoveEvent');

                    for (var key in me.elements) {
                        me.elements[key].emitElement();
                    }
                    me.$emit('userAction');
                    me.$nextTick(function () {
                        me.canvas.setCanvasSize([this.width, this.height]);

                        //TODO 네비게이터의 이미지가 $nextTick 이전에 스냅샷을 따왔기 때문에, 이미 화면이 틀어져있음.
                        //이를 위해서는 오픈그래프의 메소드를 오버라이드 해야한다. => updateSlider => 캔버스 사이즈 강제 고정으로.
                        // me.canvas.updateNavigatior();
                    })
                });

                /**
                 * Lane 이 divide 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, dividedLane)
                 */
                me.canvas.onDivideLane(function (event, dividedLane) {
                    me.$emit('divideLane', me.getElementById(dividedLane.id) || dividedLane);
                });

                /**
                 * 라벨이 Draw 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, labelText)
                 */
                me.canvas.onDrawLabel(function (event, shapeElement, labelText) {
                    me.$emit('drawLabel', me.getElementById(shapeElement.id) || shapeElement, labelText);
                });

                /**
                 * 라벨이 Change 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, afterText, beforeText)
                 */
                me.canvas.onLabelChanged(function (event, shapeElement, afterText, beforeText) {
                    console.log('label Chenage -----------------')
                    me.$emit('labelChanged', me.getElementById(shapeElement.id) || shapeElement, afterText, beforeText);
                });


                /**
                 * 라벨이 Change 되기전 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, afterText, beforeText)
                 */
                me.canvas.onBeforeLabelChange(function (event, shapeElement, afterText, beforeText) {
                    me.$emit('beforeLabelChange', me.getElementById(shapeElement.id) || shapeElement, afterText, beforeText);
                });


                /**
                 * Shape 이 Redraw 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement)
                 */
                me.canvas.onRedrawShape(function (event, shapeElement) {
                    me.$emit('redrawShape', me.getElementById(shapeElement.id) || shapeElement);
                });

                /**
                 * Shape 이 Remove 될 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement)
                 */
                me.canvas.onRemoveShape(function (event, shapeElement) {
                    me.$emit('removeShape', me.getElementById(shapeElement.id) || shapeElement);
                });

                /**
                 * Shape 이 Rotate 될 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, angle)
                 */
                me.canvas.onRotateShape(function (event, shapeElement, angle) {
                    me.$emit('Rotate', me.getElementById(shapeElement.id) || shapeElement, angle);
                });

                /**
                 * Shape 이 Move 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, offset)
                 */
                me.canvas.onMoveShape(function (event, shapeElement, offset) {
                    me.$emit('moveShape', me.getElementById(shapeElement.id) || shapeElement, offset);
                });

                /**
                 * Shape 이 Resize 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, shapeElement, offset)
                 */
                me.canvas.onResizeShape(function (event, shapeElement, offset) {
                    // console.log("resize")
                    me.$emit('resizeShape', me.getElementById(shapeElement.id) || shapeElement, offset);
                });

                /**
                 * Shape 이 Connect 되기전 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, edgeElement, fromElement, toElement)
                 */
                me.canvas.onBeforeConnectShape(function (event, edgeElement, fromElement, toElement) {
                    var result;
                    me.$emit('beforeConnectShape',
                        me.getElementById(edgeElement.id) || edgeElement,
                        me.getElementById(fromElement.id) || fromElement,
                        me.getElementById(toElement.id) || toElement,
                        function (emitResult) {
                            result = emitResult;
                        });
                    return result;
                });

                /**
                 * Shape 이 Remove 되기전 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, element)
                 */
                me.canvas.onBeforeRemoveShape(function (event, element) {
                    var result;
                    me.$emit('beforeRemoveShape',
                        me.getElementById(element.id) || element,
                        function (emitResult) {
                            result = emitResult;
                        });
                    return result;
                });
                /**
                 * Shape 이 Connect 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(eveconnectShapent, edgeElement, fromElement, toElement)
                 */
                me.canvas.onConnectShape(function (event, edgeElement, fromElement, toElement) {
                    me.$emit('connectShape',

                        me.getElementById(edgeElement.id) || edgeElement,
                        me.getElementById(fromElement.id) || fromElement,
                        me.getElementById(toElement.id) || toElement);
                });
                /**
                 * Shape 이 Disconnect 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, edgeElement, fromElement, toElement)
                 */
                me.canvas.onDisconnectShape(function (event, edgeElement, fromElement, toElement) {
                    me.$emit('disconnectShape',
                        me.getElementById(edgeElement.id) || edgeElement,
                        me.getElementById(fromElement.id) || fromElement,
                        me.getElementById(toElement.id) || toElement);
                });


                /**
                 * Shape 이 Grouping 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, groupElement)
                 */
                me.canvas.onGroup(function (event, groupElement) {
                    me.$emit('group', me.getElementById(groupElement.id) || groupElement);
                });

                /**
                 * Shape 이 UnGrouping 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, ungroupedElements)
                 */
                me.canvas.onUnGroup(function (event, ungroupedElements) {
                    var ungroupedComponents = [];
                    for (var i = 0; i < ungroupedElements.lenght; i++) {
                        ungroupedComponents.push(me.getElementById(ungroupedElements[i].id) || ungroupedElements[i]);
                    }
                    me.$emit('unGroup', ungroupedComponents);
                });

                /**
                 * Group 이 Collapse 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, element)
                 */
                me.canvas.onCollapsed(function (event, element) {
                    me.$emit('collapsed', me.getElementById(element.id) || element);
                });

                /**
                 * Group 이 Expand 되었을 때의 이벤트 리스너
                 *
                 * @param {Function} callbackFunc 콜백함수(event, element)
                 */
                me.canvas.onExpanded(function (event, element) {
                    me.$emit('expanded', me.getElementById(element.id) || element);
                });

                /**
                 *
                 * @param {Function} callbackFunc 콜백함수(event, edgeElement, sourceElement, targetElement)
                 */
                me.canvas.onDuplicated(function (event, edgeElement, sourceElement, targetElement) {
                    me.$emit('clone',
                        me.getElementById(edgeElement.id) || edgeElement,
                        me.getElementById(sourceElement.id) || sourceElement,
                        me.getElementById(targetElement.id) || targetElement);
                });
            },
            addElement: function (elementComponenet, id) {
                this.elements[id] = elementComponenet;
            },
            removeElement: function (id) {
                var me = this;
                // console.log("removeElement: ", id)
                var result;
                this.$emit('beforeDestroyElement',
                    me.getElementById(id),
                    function (emitResult) {
                        result = emitResult;
                    });

                //beforeDestroyElement 결과가 false 이면 삭제하지 않음.
                if (typeof result == 'boolean' && !result) {
                    // console.log('beforeDestroyElement, prevent remove!!', id);
                } else {
                    delete this.elements[id];
                    //도형이 남아있다면 도형을 삭제한다.
                    //이때, 도형과 연결된 선분이 있다면 연결을 해제하고 삭제한다.
                    var element = this.canvas.getElementById(id);
                    if (element) {
                        $(element).removeAttr('_toedge');
                        $(element).removeAttr('_fromedge');
                        this.canvas.removeShape(element, true);
                    }
                }

                // console.log("*******************" + id)
                // var obj = {
                //     state: "delete"
                // }
                // this.$EventBus.$emit(id, obj)
                // console.log("*******************" + id)
            },
            /**
             * 무작위 랜덤 아이디 생성
             * @returns {string} 랜덤 아이디
             */
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            printTimer: function (startTime, endTime) {
                var total = endTime - startTime;
                // console.log('Total progress time', total);
                // console.log('Canvas Rendering time', JSON.stringify(this.timerMap, null, 2));
                this.timerMap = {
                    renderingTime: {}
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .canvas-wrapper {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
        overflow: scroll;
    }

    .canvas-container {
        position: relative;
        width: 2000px;
        height: 2000px;
        background: #f7f7f7;
    }
</style>
