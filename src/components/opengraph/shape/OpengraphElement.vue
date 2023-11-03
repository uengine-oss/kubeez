<template>

</template>

<script>
    export default {
        name: 'opengraph-element',
        props: {
            redraw: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            id: String,
            parentId: String,
            x: {
                default: function () {
                    return 0;
                },
                type: Number
            },
            y: {
                default: function () {
                    return 0;
                },
                type: Number
            },
            width: {
                default: function () {
                    return 10;
                },
                type: Number
            },
            height: {
                default: function () {
                    return 10;
                },
                type: Number
            },
            angle: {
                default: function () {
                    return 0;
                },
                type: Number
            },
            _style: {
                default: function () {
                    return {};
                },
                type: Object
            },
            label: {
                default: function () {
                    return '';
                },
                type: String
            },
            image: String,
            vertices: {
                default: function () {
                    return [];
                },
                type: Array
            },
            html: String,
            xml: String,
            text: String,
            watchData: Object,

            /**
             * 연결 정의
             */
            from: String,
            to: String,
            fromPosition: {
                default: function () {
                    return [50, 50];
                },
                type: Array
            },
            toPosition: {
                default: function () {
                    return [50, 50];
                },
                type: Array
            },
            fromLabel: String,
            toLabel: String,

            /**
             * 서브 도형 프로퍼티
             */
            subZIndex: Number,
            subWidth: {
                default: function () {
                    return '100%';
                },
                type: [String, Number]
            },
            subHeight: {
                default: function () {
                    return '100%';
                },
                type: [String, Number]
            },
            subTop: {
                default: function () {
                    return '0px';
                },
                type: [String, Number]
            },
            subBottom: [String, Number],
            subLeft: {
                default: function () {
                    return '0px';
                },
                type: [String, Number]
            },
            subRight: [String, Number],
            subAlign: String,
            subVerticalAlign: String,
            subStyle: {
                default: function () {
                    return {};
                },
                type: Object
            },
            /**
             * 도형 속성
             */
            selectable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 이동 가능여부
             * @type Boolean
             */
            movable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },

            /**
             * 리사이즈 가능여부
             * @type Boolean
             */
            resizable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 가로방향 리사이즈 가능
             * @type {boolean}
             */
            resizex: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 세로 방향 리사이즈 가능
             * @type {boolean}
             */
            resizey: {
                default: function () {
                    return true;
                },
                type: Boolean
            },


            /**
             * 회전 가능여부
             * @type Boolean
             */
            rotateable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },

            /**
             * 연결 가능여부
             * @type Boolean
             */
            connectable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },

            /**
             * From 연결 가능여부 (From(Shape) => To)
             * @type Boolean
             */
            enableFrom: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * To 연결 가능여부 (From => To(Shape))
             * @type Boolean
             */
            enableTo: {
                default: function () {
                    return true;
                },
                type: Boolean
            },


            /**
             * Self 연결 가능여부
             * @type Boolean
             */
            selfConnectable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },

            /**
             * 가이드에 자기자신을 복사하는 컨트롤러 여부.
             * @type Boolean
             */
            connectCloneable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },

            /**
             * 드래그하여 연결시 연결대상 있는 경우에만 Edge 드로잉 처리 여부
             * @type Boolean
             */
            connectRequired: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 드래그하여 연결시 그룹을 건너뛸때 스타일 변경 여부
             * @type Boolean
             */
            connectStyleChange: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * 가이드에 삭제 컨트롤러 여부
             * @type Boolean
             */
            deletable: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * 라벨 수정여부
             * @type Boolean
             */
            labelEditable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },
            /**
             * 복사 가능 여부
             * @type {boolean}
             */
            copyable: {
                default: function () {
                    return true;
                },
                type: Boolean
            },

            /**
             * custom move action 존재 여부
             * @type Boolean
             */
            customMoveActionExist: {
                default: function () {
                    return false;
                },
                type: Boolean
            },
            /**
             * x,y 축만 이동 가능여부. Y | N | none
             * @type {null}
             */
//      copyable: {
//        default: function () {
//          return 'none';
//        },
//        type: String
//      }
        },
        computed: {
            opengraphRole: function () {
                return 'opengraph-element';
            },
            _id: function () {
                if (this.id) {
                    return this.id;
                } else {
                    return this.immidiateId;
                }
            }
        },
        data: function () {
            return {
                innerRedraw: false,
                props: JSON.parse(JSON.stringify(this.$props)),
                elementRole: null,
                shapdId: 'OG.shape.' + this.uuShapeId(),
                immidiateId: this.uuid(),
                canvasComponent: null,
                parentElementComponent: null,
                parentControllerComponent: null,
                element: null,
                bindElementEvent: false,
                shape: null,
                geometrys: {},
                subshapes: {},
                subcontrollers: {},
                isCustomMoveInnerAction: false
            }
        },
        watch: {
            '$props': {
                handler: function (newVal, oldVal) {
                    if (this.elementRole != 'opengraph-element') {
                        return;
                    }
                    //// console.log('1. $props change detected!! => ' + this._id);
                    this.props = JSON.parse(JSON.stringify(newVal));
                },
                deep: true
            },
            props: {
                handler: function (newVal, oldVal) {
                    if (this.elementRole != 'opengraph-element') {
                        return;
                    }

                    if (this.innerRedraw) {
                        //// console.log('2. $props change by inner side, so it will skip redraw element.');
                        this.innerRedraw = false;
                        return;
                    }
                    //// console.log('2. $props change by out side, so it will continue redraw element.');

                    var needToWatch = false;
                    var needToWatchKeys = [];
                    //리드로우 트리거가 true 일때는 다시 그리기.
                    if (newVal['redraw'] == true) {
                        //// console.log('3. redraw property is true, it will force redraw element.');
                        needToWatch = true;
                        needToWatchKeys.push('redraw');
                    } else {
                        for (var key in newVal) {
                            //신규값과 이전값이 모두 null 이거나 undefined 일때는 반응하지 않는다.
                            if (!newVal[key] && !oldVal[key]) {

                            } else if (typeof newVal[key] == 'object') {
                                if (!oldVal[key] || JSON.stringify(newVal[key]) != JSON.stringify(oldVal[key])) {
                                    //// console.log('3. property diff', key, newVal[key], oldVal[key]);
                                    needToWatch = true;
                                    needToWatchKeys.push(key);
                                }
                            } else {
                                if (newVal[key] != oldVal[key]) {
                                    needToWatch = true;
                                    //// console.log('3. property diff', key, newVal[key], oldVal[key]);
                                    needToWatchKeys.push(key);
                                }
                            }
                        }
                    }

                    if (!needToWatch) {
                        //// console.log('3. we scaned $props, but nothing changed. skip redraw.');
                        return;
                    } else {
                        //// console.log('3. we found $props change, ' + needToWatchKeys.join() + '.');
                    }


                    if (!this.element) {
                        //// console.log('4. finally, drawShape', this._id);
                        this.drawShape();
                    } else {
                        //// console.log('4. finally, updateShape', this._id);
                        this.updateShape();
                    }
                },
                deep: true
            }
        },
        destroyed: function () {
            var me = this;
            // // console.log(me)
            //오픈그래프 역할일 경우 캔버스에 엘리먼트 등록 삭제.
            if (me.elementRole == 'opengraph-element') {
                if (me.canvasComponent) {
                    // console.log('** opengraph element component destroyed!!', me._id);
                    me.canvasComponent.removeElement(me._id);
                }
            }
            //서브 엘리먼트 역할일 경우 서브엘리먼트 등록 삭제
            else if (this.elementRole == 'sub-elements') {
                if (this.parentElementComponent) {
                    this.parentElementComponent.removeSubShapes(me._id);
                }
            }
            //서브 컨트롤러 역할일 경우 서브컨트롤러 등록 삭제
            else if (this.elementRole == 'sub-controller') {
                if (this.parentControllerComponent) {
                    this.parentControllerComponent.removeControllerElement();
                }
            }
        },
        mounted: function () {
            var me = this;
            this.setElementRole();

            //오픈그래프 엘리먼트 역할일 경우 렌더링 수행
            if (this.elementRole == 'opengraph-element') {
                // console.log('drawShape', this._id);
                this.drawShape();
            }
            //서브 엘리먼트 역할일 경우 서브엘리먼트 등록
            else if (this.elementRole == 'sub-elements') {
                if (this.parentElementComponent) {
                    this.parentElementComponent.addSubShapes(this, me._id);
                }
            }
            //서브 컨트롤러 역할일 경우 서브컨트롤러 등록
            else if (this.elementRole == 'sub-controller') {
                if (this.parentControllerComponent) {
                    this.parentControllerComponent.addCloneElement(this);
                }
            }
        },
        methods: {
            addGeometry: function (geometryComponenet, id) {
                //// console.log('** addGeometry to ', this._id);
                this.geometrys[id] = geometryComponenet;
            },
            removeGeometry: function (id) {
                //// console.log('** removeGeometry to ', this._id);
                delete this.geometrys[id];
            },
            addSubShapes: function (subShapeComponenet, id) {
                //// console.log('** addSubShapes to ', this._id);
                this.subshapes[id] = subShapeComponenet;
            },
            removeSubShapes: function (id) {
                //// console.log('** removeSubShapes to ', this._id);
                delete this.subshapes[id];
            },
            addSubContollers: function (subControllerComponenet, id) {
                //// console.log('** addSubContollers to ', this._id);
                this.subcontrollers[id] = subControllerComponenet;
            },
            removeSubContollers: function (id) {
                //// console.log('** removeSubContollers to ', this._id);
                delete this.subcontrollers[id];
            },
            emitElement: function () {
                //innerRedraw 를 등록하여 내부적인 업데이트인지 판별한다.
                this.innerRedraw = true;
                var me = this;
                if (!me.element) {
                    //// console.log('** element not found, so skip emit $props. ', this._id);
                    return;
                }
                let boundary = me.canvasComponent.canvas.getBoundary(me.element);
                if (!boundary) {
                    //// console.log('** element not found, so skip emit $props. ', this._id);
                    return;
                }

                //// console.log('** start to emit $props. ', this._id);

                //리드로우는 false 로 원복한다.
                me.$emit('update:redraw', false);

                if (me.element.shape instanceof OG.shape.EdgeShape) {
                    let vertices = JSON.parse('[' + me.element.shape.geom.vertices.toString() + ']');

                    if (this.customMoveActionExist) {

                    } else {
                        me.$emit('update:vertices', vertices);
                    }
                    // me.$emit('update:vertices', vertices);


                    var _from = $(me.element).attr('_from');
                    var _to = $(me.element).attr('_to');
                    var from, to, fromPosition, toPosition
                    if (_from) {
                        from = _from.split('_TERMINAL_')[0];
                        fromPosition = _from.split('_TERMINAL_')[1].split('_');
                        fromPosition = [parseFloat(fromPosition[0]), parseFloat(fromPosition[1])];
                    }
                    if (_to) {
                        to = _to.split('_TERMINAL_')[0];
                        toPosition = _to.split('_TERMINAL_')[1].split('_');
                        toPosition = [parseFloat(toPosition[0]), parseFloat(toPosition[1])];
                    }

                    if (this.customMoveActionExist) {

                    } else {
                        me.$emit('update:from', from);
                        me.$emit('update:to', to);
                        me.$emit('update:fromPosition', fromPosition);
                        me.$emit('update:toPosition', toPosition);
                    }

                } else {
                    //inner BC
                    if (me.customMoveActionExist) {
                    // if (this.customMoveActionExist && !this.isCustomMoveInnerAction) {
                        // console.log(me._id,'x:', boundary.getCentroid().x, '  / y:', boundary.getCentroid().y)
                    } else {
                        me.$emit('update:id', me._id);
                        me.$emit('update:width', boundary.getWidth());
                        me.$emit('update:height', boundary.getHeight());
                        me.$emit('update:x', boundary.getCentroid().x);
                        me.$emit('update:y', boundary.getCentroid().y);
                    }


                    // me.$emit('update:y', boundary.getCentroid().y);

                }

                var style = JSON.parse(JSON.stringify(me.element.shape.geom.style.map));
                me.$emit('update:_style', style);

                //부모 아이디
                var parent = me.canvasComponent.canvas.getRenderer().getParent(me.element);
                var parentId;
                if (parent) {
                    parentId = parent.id;
                } else {
                    parentId = null;
                }
                //me.props.parentId = parentId;
                me.$emit('update:parentId', parentId);

                this.props = JSON.parse(JSON.stringify(this.props))
                // console.log(this.props)
            },
            setElementRole: function () {
                var me = this;
                var parentElementComponent = null;
                var parent;
                var elementRole;
                var getParent = function (component) {
                    parent = component.$parent;
                    if (parent) {

                        //캔버스를 만나면 중단한다.
                        if (parent.opengraphRole == 'canvas') {
                            me.canvasComponent = parent;
                            me.elementRole = 'opengraph-element';
                        }
                        //서브 엘리먼트를 만나면 상위 컴포넌트를 찾을때까지 계속한다.
                        else if (parent.opengraphRole == 'sub-elements') {
                            me.elementRole = 'sub-elements';
                            getParent(parent);
                        }
                        //서브 컨트롤러를 만나면 중단한다.
                        else if (parent.opengraphRole == 'sub-controller') {
                            me.elementRole = 'sub-controller';
                            me.parentControllerComponent = parent;
                        }
                        //상위 컴포넌트를 만나면 중단한다.
                        else if (parent.opengraphRole == 'opengraph-element') {
                            me.parentElementComponent = parent;
                        } else {
                            getParent(parent);
                        }
                    }
                }
                getParent(this);

                //상위 컴포넌트를 만나는동안 서브엘리먼트를 만나지 못했다면 에러
                if (me.parentElementComponent && me.elementRole != 'sub-elements') {
                    throw new Error('Child element in element should be in sub-elements.');
                }

                //상위 컴포넌트가 없고, 캔버스를 만나지 못하고 컨트롤러에 등록된 상태가 아니면  에러
                if (!me.parentElementComponent && !me.canvasComponent && !me.parentControllerComponent) {
                    throw new Error('Not found canvas for element.');
                }

                //상위 컴포넌트가 없고, 캔버스가 있을 때 캔버스에 등록
                if (!me.parentElementComponent && me.canvasComponent) {
                    me.canvasComponent.addElement(this, me._id);
                }
            },
            updateShape: function () {
                //아이디가 업데이트 된 경우
                var me = this;
                if (me._id != me.element.id) {
                    //선택된 엘리먼트 모두 선택 취소.
                    me.canvasComponent.canvas._HANDLER.deselectAll();
                    me.element = me.canvasComponent.canvas.updateId(me.element, me._id);
                }
                //아이디를 보전하며 다시 그린다.
                this.drawShape();
            },
            drawShape: function () {
                var me = this;
                var now = new Date();
                var shape = me.generateShape();
                shape.clone = function () {
                    return me.generateShape();
                };
                if (!shape) {
                    return;
                } else {
                    shape.createSubShape = function () {
                        return me.generateSubShapes();
                    };
                    shape.createController = function () {
                        return me.generateSubController();
                    };

                    //shape 속성 달기
                    me.bindShapeProperties(shape);

                    //shape 이벤트 달기
                    me.bindShapeEvents(shape);

                    //style 복사하기.
                    var style = JSON.parse(JSON.stringify(me._style));

                    //shape.TYPE
                    //if(OG.Constants.SHAPE_TYPE.TEXT)
                    switch (shape.TYPE) {
                        case OG.Constants.SHAPE_TYPE.GEOM:
                        case OG.Constants.SHAPE_TYPE.GROUP:
                            me.element = me.canvasComponent.canvas.drawShape([me.x, me.y], shape, [me.width, me.height, me.angle], style, me._id, me.parentId);
                            if (shape instanceof OG.HorizontalLaneShape) {
                                var parent = me.canvasComponent.canvas.getRenderer().getParent(me.element);
                                if (parent && parent.shape instanceof OG.HorizontalLaneShape) {
                                    var beforeTarget = null;
                                    $.each(parent.childNodes, function (i, childNode) {
                                        if (childNode.tagName == 'g') {
                                            beforeTarget = childNode;
                                            return false;
                                        }
                                    })
                                    parent.insertBefore(me.element, beforeTarget ? beforeTarget : parent.firstChild);
                                }
                            }
                            // me.canvasComponent.canvas.getRenderer().redrawConnectedEdge(shape, []);
                            me.canvasComponent.canvas.getRenderer().redrawConnectedEdge(me.element, []);
                            break;
                        case OG.Constants.SHAPE_TYPE.EDGE:
                            if (me.vertices && me.vertices.length > 1) {
                                var geom = new OG.geometry.PolyLine(me.vertices);
                                geom.type = 'PolyLine';
                                shape.geom = geom;
                            }

                            var addAttrValues = function (element, name, value) {
                                var attrValue = $(element).attr(name),
                                    array = attrValue ? attrValue.split(",") : [],
                                    newArray = [];
                                $.each(array, function (idx, item) {
                                    if (item !== value) {
                                        newArray.push(item);
                                    }
                                });
                                newArray.push(value);

                                $(element).attr(name, newArray.toString());
                                return element;
                            };

                            var fromElement, toElement, fromTerminal, toTerminal, fromP, toP;


                            if (me.from) {
                                fromElement = me.canvasComponent.canvas.getElementById(me.from);
                                fromTerminal = me.from + '_TERMINAL_' + me.fromPosition[0] + '_' + me.fromPosition[1];
                                fromP = me.canvasComponent.canvas.getRenderer()._getPositionFromTerminal(fromTerminal);
                            }
                            if (me.to) {
                                toElement = me.canvasComponent.canvas.getElementById(me.to);
                                toTerminal = me.to + '_TERMINAL_' + me.toPosition[0] + '_' + me.toPosition[1];
                                toP = me.canvasComponent.canvas.getRenderer()._getPositionFromTerminal(toTerminal);
                            }

                            //vertices 가 없고, 연결할 대상이 있다면 connect 로 연결한다. 이때 연결 노드 정보는 자동으로 생성됨.
                            if ((!me.vertices || me.vertices.length < 2) && fromElement && toElement) {

                                me.element = me.canvasComponent.canvas.connect(
                                    fromElement, toElement, style, me.label, fromP, toP, true, me._id);
                            }
                            //vertices 가 있고 연결할 대상이 있는 경우
                            else if (fromElement && toElement) {
                                me.element = me.canvasComponent.canvas.connect(
                                    fromElement, toElement, style, me.label, fromP, toP, true, me._id, shape);
                            }
                            //그 외 연결할 대상이 없는 경우
                            else {
                                me.element = me.canvasComponent.canvas.drawShape(null, shape, null, style, me._id, null, true);
                            }
                            //스타일은 복사하여 pops 에 영향을 주지 않도록 한다.
                            break;
                        case OG.Constants.SHAPE_TYPE.HTML:
                            me.element = me.canvasComponent.canvas.drawShape([me.x, me.y], shape, [me.width, me.height, me.angle], style, me._id, me.parentId);
                            break;
                        case OG.Constants.SHAPE_TYPE.IMAGE:
                            me.element = me.canvasComponent.canvas.drawShape([me.x, me.y], shape, [me.width, me.height, me.angle], style, me._id, me.parentId);
                            break;
                        case OG.Constants.SHAPE_TYPE.TEXT:
                            me.element = me.canvasComponent.canvas.drawShape([me.x, me.y], shape, [me.width, me.height, me.angle], style, me._id, me.parentId);
                            break;
                        case OG.Constants.SHAPE_TYPE.SVG:
                            me.element = me.canvasComponent.canvas.drawShape([me.x, me.y], shape, [me.width, me.height, me.angle], style, me._id, me.parentId);
                            break;
                    }


                    if (this.customMoveActionExist) {

                        me.element.customMoveAction = function (dx, dy, dw, dh, du, dlw, dl, dr) {
                            me.$emit('customMoveAction', dx, dy, dw, dh, du, dlw, dl, dr);
                        }
                        me.element.customRelationMoveAction = function (vertices) {
                            me.$emit('customRelationMoveAction', vertices);
                        }
                    }

                    this.setGroup();
                    this.bindElementEvents();
                    this.emitElement();


                    window.Vue.OGBus.$emit('renderingTime', this.canvasComponent.id, Date.now() - now);
                }
            },
            setGroup: function () {
                var me = this;

                //도형이 없거나, 부모가 설정된 경우라면 리턴.
                if (!me.element || me.parentId) {
                    return;
                }
                //draw 대상이 Edge 이면 리턴.
                if (me.canvasComponent.canvas.getRenderer().isEdge(me.element)) {
                    return;
                }
                //draw 대상이 Lane 인 경우 리턴.
                if (me.canvasComponent.canvas.getRenderer().isLane(me.element)) {
                    return;
                }

                //그룹위에 그려졌을 경우 그룹처리
                var frontGroup = me.canvasComponent.canvas.getRenderer()
                    .getFrontForBoundary(me.canvasComponent.canvas.getRenderer().getBoundary(me.element));

                if (!frontGroup) {
                    return;
                }
                //그룹이 Lane 인 경우 RootLane 으로 변경
                if (me.canvasComponent.canvas.getRenderer().isLane(frontGroup)) {
                    frontGroup = me.canvasComponent.canvas.getRenderer().getRootLane(frontGroup);
                }
                //그룹 드랍가능이 아니면 리턴.
                if (!me.canvasComponent.canvas.getRenderer()._CONFIG.GROUP_DROPABLE || !frontGroup.shape.GROUP_DROPABLE) {
                    return;
                }
                //자신일 경우 반응하지 않는다.
                if (frontGroup.id === me.element.id) {
                    return;
                }
                frontGroup.appendChild(me.element);
            },
            /**
             * 도형 프로퍼티를 등록한다.
             * @param shape
             */
            bindShapeProperties: function (shape) {
                // 현재 이곳에서 1회만 실행되는 문제 존재함.
                shape.SELECTABLE = this.selectable;
                shape.MOVABLE = this.movable;
                shape.RESIZABLE = this.resizable;
                shape.RESIZEX = this.resizex;
                shape.RESIZEY = this.resizey;
                shape.CONNECTABLE = this.connectable;
                shape.ROTATEABLE = this.rotateable;
                shape.ENABLE_FROM = this.enableFrom;
                shape.ENABLE_TO = this.enableTo;
                shape.SELF_CONNECTABLE = this.selfConnectable;
                shape.CONNECT_CLONEABLE = this.connectCloneable;
                shape.CONNECT_REQUIRED = this.connectRequired;
                shape.CONNECT_STYLE_CHANGE = this.connectStyleChange;
                shape.DELETABLE = this.deletable;
                shape.LABEL_EDITABLE = this.labelEditable;
                shape.COPYABLE = this.copyable;
                shape.AXIS = this.axis;
            },
            /**
             * 도형 이벤트 프로퍼티를 등록한다.
             * TODO 컴포넌트 등록된 도형이 아닌경우, props 로 표현하여 리턴하는 메소드가 필요하다.
             * @param shape
             */
            bindShapeEvents: function (shape) {
                var me = this;
                shape.onResize = function (offset) {
                    me.$emit('resize', me, offset);
                };
                shape.onDrawLabel = function (text) {
                    me.$emit('drawLabel', me, text);
                };
                shape.onLabelChanged = function (text, beforeText) {
                    me.$emit('labelChanged', me, text, beforeText);
                };
                shape.onBeforeRemoveShape = function () {
                    var result;
                    me.$emit('beforeRemoveShape', me, function (emitResult) {
                        result = emitResult;
                    });
                    return result;
                };
                shape.onRemoveShape = function () {
                    me.$emit('removeShape', me);
                    console.log('OGElement, onRemoveShape ')
                };
                shape.onDrawShape = function () {
                    me.$emit('drawShape', me);
                };
                shape.onBeforeLabelChange = function (text, beforeText) {
                    var result;
                    me.$emit('beforeLabelChange', me, text, beforeText, function (emitResult) {
                        result = emitResult;
                    });
                    return result;
                };
                shape.onRedrawShape = function () {
                    me.$emit('redrawShape', me);
                };
                shape.onBeforeConnectShape = function (edge, fromShape, toShape) {
                    var result;
                    me.$emit('beforeConnectShape',
                        me.canvasComponent.getElementById(edge.id) || edge,
                        me.canvasComponent.getElementById(fromShape.id) || fromShape,
                        me.canvasComponent.getElementById(toShape.id) || toShape,
                        function (emitResult) {
                            result = emitResult;
                        });
                    return result;
                };
                shape.onConnectShape = function (edge, fromShape, toShape) {
                    me.$emit('connectShape',
                        me.canvasComponent.getElementById(edge.id) || edge,
                        me.canvasComponent.getElementById(fromShape.id) || fromShape,
                        me.canvasComponent.getElementById(toShape.id) || toShape
                    )
                };
                shape.onDisconnectShape = function (edge, fromShape, toShape) {
                    me.$emit('disconnectShape',
                        me.canvasComponent.getElementById(edge.id) || edge,
                        me.canvasComponent.getElementById(fromShape.id) || fromShape,
                        me.canvasComponent.getElementById(toShape.id) || toShape
                    )
                };
                shape.onGroup = function (groupShapeEle) {
                    me.$emit('group',
                        me.canvasComponent.getElementById(groupShapeEle.id) || groupShapeEle
                    )
                };
                shape.onUnGroup = function () {
                    me.$emit('unGroup', me);
                };
                shape.onMoveShape = function (offset) {
                    me.$emit('moveShape', me, offset);
                };

                shape.onRotateShape = function (angle) {
                    me.$emit('rotateShape', me, angle);
                };
                shape.onPasteShape = function (copied, pasted) {
                    me.$emit('pasteShape',
                        me.canvasComponent.getElementById(copied.id) || copied,
                        me.canvasComponent.getElementById(pasted.id) || pasted
                    )
                    ;
                };
                /**
                 * 자신에게 도형들이 그룹으로 들어왔을때의 이벤트
                 * @param groupElement
                 * @param elements
                 */
                shape.onAddToGroup = function (groupElement, elements, eventOffset) {
                    var addedComponents = [];
                    // // console.log(elements)
                    for (var i = 0; i < elements.length; i++) {
                        addedComponents.push(me.canvasComponent.getElementById(elements[i].id) || elements[i]);
                    }
                    me.$emit('addToGroup',
                        me.canvasComponent.getElementById(groupElement.id) || groupElement,
                        addedComponents,
                        eventOffset
                    );
                };
                /**
                 * 자신이 그룹속으로 들어갔을 때의 이벤트
                 * @param groupElement
                 * @param element
                 */
                shape.onAddedToGroup = function (groupElement, element, eventOffset) {
                    me.$emit('addedToGroup',
                        me.canvasComponent.getElementById(groupElement.id) || groupElement,
                        me.canvasComponent.getElementById(element.id) || element,
                        eventOffset
                    );
                };
                shape.onSelectShape = function () {
                    me.$emit('selectShape', me);
                };
                shape.onDeSelectShape = function () {
                    me.$emit('deSelectShape', me);
                };
            },
            /**
             * 클릭, 더블클릭 이벤트를 반영한다.
             */
            bindElementEvents: function () {
                var me = this;
                if (!me.bindElementEvent) {
                    me.bindElementEvent = true;
                    $(me.element).bind('click', function (event) {
                        event.stopPropagation();
                        me.$emit('click', event, me);
                    });

                    $(me.element).unbind('dblclick');
                    $(me.element).bind('dblclick', function (event) {
                        event.stopPropagation();
                        me.$emit('dblclick', event, me);
                    });
                }
            },
            /**
             * 서브 컨트롤러의 정보를 얻어와 shpae 의 컨트롤을 반환한다.
             * @return {Array}
             */
            generateSubController: function () {
                var me = this;
                var controllers = [];
                if (!me.subcontrollers || $.isEmptyObject(me.subcontrollers)) {
                    return controllers;
                } else {
                    for (var key in me.subcontrollers) {
                        var controllerComponent = me.subcontrollers[key];
                        var cloneable = controllerComponent.cloneable;
                        if (cloneable) {
                            me.addCloneableController(controllerComponent, controllers);
                        } else {
                            me.addClickController(controllerComponent, controllers);
                        }
                    }
                    return controllers;
                }
            },
            addClickController: function (controllerComponent, controllers) {
                var me = this;
                controllers.push({
                    image: controllerComponent.image,
                    action: function (event, element) {
                        controllerComponent.$emit('click', event, me);
                    }
                })
            },
            addCloneableController: function (controllerComponent, controllers) {
                var me = this;
                //컨트롤러의 clone 이벤트 트리거 등록. (카피된 대상:generateShape 에 이벤트를 등록한다.)
                var generateShape = controllerComponent.cloneComponent.generateShape();
                generateShape.onDuplicated = function (edge, target, copy) {
                    controllerComponent.$emit('clone',
                        me.canvasComponent.getElementById(edge.id) || edge,
                        me.canvasComponent.getElementById(target.id) || target,
                        me.canvasComponent.getElementById(copy.id) || copy);
                };
                controllers.push({
                    image: controllerComponent.image,
                    create: {
                        shape: generateShape,
                        width: controllerComponent.cloneComponent.width,
                        height: controllerComponent.cloneComponent.height,
                        style: JSON.parse(JSON.stringify(controllerComponent.cloneComponent._style))
                    }
                })
            },
            generateSubShapes: function () {
                var me = this;
                var subShape = [];
                if (!me.subshapes || $.isEmptyObject(me.subshapes)) {
                    return subShape;
                } else {
                    for (var key in me.subshapes) {
                        let shape = me.subshapes[key].generateShape();
                        subShape.push({
                            shape: shape,
                            vertices: me.subshapes[key].vertices,
                            width: me.subshapes[key].subWidth,
                            height: me.subshapes[key].subHeight,
                            top: me.subshapes[key].subTop,
                            bottom: me.subshapes[key].subBottom,
                            left: me.subshapes[key].subLeft,
                            right: me.subshapes[key].subRight,
                            align: me.subshapes[key].subAlign,
                            'vertical-align': me.subshapes[key].subVerticalAlign,
                            'z-index': me.subshapes[key].subZIndex,
                            style: JSON.parse(JSON.stringify(me.subshapes[key].subStyle))
                        })
                    }
                    return subShape;
                }
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            uuShapeId: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return 's' + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
