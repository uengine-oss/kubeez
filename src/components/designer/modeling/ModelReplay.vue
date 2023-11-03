<template xmlns:v-on="http://www.w3.org/1999/xhtml">

</template>

<script>
    // import StorageBase from "./StorageBase";
    import StorageBase from "./ModelStorageBase";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });
    var jp = require('jsonpath');

    export default {
        name: 'model-replay',
        mixins: [StorageBase],
        props: {
            projectId: {
                type: String,
                default: function () {
                    return null;
                }
            },
            projectName: {
                type: String,
                default: function () {
                    return ''
                }
            },
            sliderLocationScale: {
                type: Number,
                default: function () {
                    return 1;
                }
            },
            value: {
                type: Object,
                default: function () {
                    return {'elements': {}, 'relations': {}}
                }
            },
            dragPageMovable: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
            readOnly: {
                type: Boolean,
                default: function () {
                    return true
                }
            },
            imageBase: {
                type: String,
                default: function () {
                    return 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/'
                }
            },
            snapshotDefaultThumbnail: {
                type: String,
                default: function () {
                    return null;
                }
            },
            type: {
                type: String,
                default: function () {
                    return 'es';
                }
            },

        },
        data() {
            return {
                componentKey: 0,
                loading: false,
                user:{
                    accessToken: null,
                },
                mainSeparatePanel:{
                    min:5,
                    max:95,
                    current:100
                },
                model:{
                    uid: null,
                    projectId: null,
                    permissions: null,
                },
                slider: {
                    min: 0,
                    max: 0,
                    current: 0,
                },
                sliderLists:[],
                snapshotLists:[],
                versionLists:[],

                detail:{
                    show: false,
                    isMark: false,
                    title: '',
                    subTitle: '',
                    contents: '',
                    image: '',
                    date: '',
                    item: null
                },

                canvas: null,
                condition: null,
                dialog: false,
            }
        },
        created: function () {
            var me = this
            me.init()

        },
        computed: {
            isOnPrem() {
                if (window.MODE == "onprem") {
                    return true
                } else {
                    return false
                }
            },
            scmTag(){
                if(this.value && this.value.scm && this.value.scm.tag){
                    return this.value.scm.tag;
                }
                return null;
            },
            scmOrg(){
                if(this.value && this.value.scm && this.value.scm.org){
                    return this.value.scm.org;
                }
                return null;
            },
            scmRepo(){
                if(this.value && this.value.scm && this.value.scm.repo){
                    return this.value.scm.repo;
                }
                return null;
            },
            isOwnModel(){
                var me = this
                if(me.userInfo.uid == me.modelUid){
                    return true;
                }
                return false;
            },
            showVersionBtn(){
                var me = this
                if(me.isOwnModel){
                    return true;
                } else if(me.model.permissions && me.model.permissions[me.userInfo.uid]) {
                    return me.model.permissions[me.userInfo.uid].write
                }
                return false
            },
            filteredSnapshotLists(){
                return this.snapshotLists.sort((a, b) => {
                    if (a.timeStamp < b.timeStamp) {
                        return -1;
                    }
                    if (a.timeStamp > b.timeStamp) {
                        return 1;
                    }
                    return 0;
                });
            },
            filteredVersionLists(){
                var me = this
                let versionListsCopy = me.versionLists.slice();

                //
                let queueListLength = me.sliderLists.length - 1;
                versionListsCopy.forEach(function (mark,index) {
                    let markIndex = -1;
                    if(mark.lastQueueKey){
                        markIndex = me.sliderLists.findIndex( x=> mark.lastQueueKey == x.key);
                    } else{
                        if(me.sliderLists[queueListLength].timeStamp < mark.timeStamp){
                            markIndex = queueListLength;
                        }else{
                            var matchQueue = me.sliderLists.find( x=> mark.timeStamp <= x.timeStamp);
                            markIndex = me.sliderLists.findIndex( x=> x.timeStamp == matchQueue.timeStamp);
                        }
                    }
                    versionListsCopy[index].markIndex = markIndex == -1 ? 0: markIndex;
                })
                //

               return versionListsCopy.sort((a, b) => {
                    if (a.timeStamp < b.timeStamp) {
                        return -1;
                    }
                    if (a.timeStamp > b.timeStamp) {
                        return 1;
                    }
                    return 0;
                });
            },
            sliderCurrentDate(){
                if(this.currentQueue){
                    var currentQueueTimeStamp = this.currentQueue.timeStamp;
                    return this.convertTimeStamp(currentQueueTimeStamp);
                }
                return null;
            },
            sliderCurrent(){
                return this.slider.current
            },
            currentQueue(){
                return this.sliderLists[this.sliderCurrent];
            },
            currentQueueKey(){
                return this.currentQueue ? this.currentQueue.key : null
            },

            currentSnapshot(){
                var queueTimeStamp = this.currentQueue.timeStamp
                return this.filteredSnapshotLists.filter(item => item.timeStamp < queueTimeStamp).reverse()[0];
            },
            currentSnapshotKey(){
                return this.currentSnapshot ? this.currentSnapshot.key : null;
            },
            modelProjectId(){
                //required
                return this.model.projectId;
            },
            modelUid(){
                //required
                return this.model.uid;
            },

        },
        watch: {
            "currentQueueKey": {
                deep:true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    if( !me.loading ){
                        me.changeUrl(`/#/replay/${me.modelProjectId}/${me.currentQueueKey}`);
                        me.onLoad();
                    }
                }, 100)
            },

        },
        methods: {
            loadScmUrl(){
                var me = this
                if(me.scmOrg && me.scmRepo){
                    if(this.isOnPrem){
                        return `https://gitlab.${window.location.host.replace("www.", "")}/${me.scmOrg}/${me.scmRepo}`
                    } else {
                        return `https://github.com/${me.scmOrg}/${me.scmRepo}`
                    }
                } else {
                    return null
                }
            },
            parserUrl(fullUrl){
                var url = fullUrl.split('://')[1]
                var array = url.split('/');
                if(url && array.length == 3 && array[2]){
                    var host = array[0];
                    var org = array[1];
                    var repo = array[2];
                    return {host:host, org: org, repo:repo}
                }
                return null;
            },
            async validateStorageCondition(item){
                var me = this

                if(item.usedSCM && !me.parserUrl(item.scmUrl)){
                    item.error = {
                        'scmUrl': 'Not enough information. Please check the url format.'
                    }
                    return false;
                }

                // checked Version
                if( !item.version ){
                    item.version = await me.pushString(`db://definitions/${me.modelProjectId}/versionLists`)
                }

                // validate Path
                var validate = await me.isValidatePath(`db://definitions/${me.modelProjectId}/versionLists/${item.version.replaceAll('.','-')}`)
                if( !(validate.status && !item.version.replaceAll('.','-').includes('/') && !item.version.replaceAll('.','-').includes(':')) ){
                    var otherMsg = 'Paths must be non-empty strings and can\'t contain  "/" or ":"'
                    var obj ={
                        'version': item.version.replaceAll('.','-').includes('/') || item.version.replaceAll('.','-').includes(':') ? otherMsg : validate.msg,
                    }
                    item.error = obj
                    return false
                }

                var existVersion = await me.list(`db://definitions/${me.modelProjectId}/versionLists/${item.version.replaceAll('.','-')}`)
                if(existVersion){
                    var otherMsg = 'This version already exists.'
                    var obj ={
                        'version': otherMsg,
                    }
                    item.error = obj
                    return false
                }

                return true
            },
            async addVersion() {
                var me = this
                try {
                    me.condition.loading = true;
                    me.$EventBus.$emit('progressValue', true);

                    var check = await me.validateStorageCondition(me.condition);
                    if(check) {
                        var key = me.currentQueue.key
                        var timeStamp = me.currentQueue.timeStamp;
                        var value = me.value
                        var originProjectId = me.modelProjectId
                        var projectVersion = me.condition.version.replaceAll('.','-').trim();
                        var obj = me.parserUrl(me.condition.scmUrl);

                        if(me.condition.usedSCM){
                            value.scm.org = obj.org;
                            value.scm.repo = obj.repo;
                            value.scm.tag = me.condition.scmVersion;
                        }

                        me.$refs['modeler-image-generator'].save(me.projectName, me.canvas)
                            .then(async function (img) {
                                // var versionValueObj = {
                                //     value: JSON.stringify(value),
                                // }
                                let valueUrl = await me.putString(`storage://definitions/${originProjectId}/versionLists/${projectVersion}/versionValue`, JSON.stringify(value));

                                var versionInfoObj = {
                                    lastQueueKey: key,
                                    saveUser: me.userInfo.uid,
                                    saveUserEmail: me.userInfo.email,
                                    saveUserName: me.userInfo.name,
                                    projectName: me.condition.editProjectName,
                                    img: img,
                                    timeStamp: timeStamp,
                                    comment: me.condition.comment,
                                    valueUrl: valueUrl
                                }

                                await me.putObject(`db://definitions/${originProjectId}/versionLists/${projectVersion}`, versionInfoObj)
                                // await me.putObject(`db://definitions/${originProjectId}/versionLists/${projectVersion}/versionInfo`, versionInfoObj)
                                // await me.putObject(`db://definitions/${originProjectId}/versionLists/${projectVersion}/versionValue`, versionValueObj)

                                me.closeDialog()
                                //alert('Success: Saved model.')
                            });

                    } else {
                        me.condition.loading = false
                        me.$EventBus.$emit('progressValue', false);
                    }
                } catch (e) {
                    console.log(e)

                }
            },
            validateRelation(fromId, toId) {
                var me = this
                try {
                    var relations = me.value.relations
                    if (relations) {
                        var index = Object.values(relations).findIndex(relation => relation && relation.from == fromId && relation.to == toId)
                        if (index == -1) {
                            return true
                        }
                    }
                    return false
                } catch (e) {
                    return true
                }
            },
            showDialog(){
                var me = this

                me.condition = {
                    action: 'backup',
                    title: 'Create Version',
                    projectName: me.projectName,
                    editProjectName: JSON.parse(JSON.stringify(me.projectName)),
                    comment: me.comment,
                    scmUrl: JSON.parse(JSON.stringify(me.loadScmUrl())),
                    scmVersion: null,
                    version: me.defaultVersion,
                    error: null,
                    loading: false,
                    isReplay: true,
                    usedSCM: false,
                }
                me.dialog = true;
            },
            closeDialog(){
                var me = this
                me.condition.loading = false;
                me.$EventBus.$emit('progressValue', false);
                me.condition = null;
                me.dialog = false;
            },
            resetDetail(){
                this.detail = {
                    show: false,
                    isMark: false,
                    title: '',
                    subTitle: '',
                    contents: '',
                    image: '',
                };
            },
            onOverSliderQueue(event){
                var me = this

                me.resetDetail();

                if(event.type == 'mouseleave'){

                } else if( event.type =='mouseover' || 'mouseup' == event.type ){
                    var info = me.elementComment(me.currentQueue)

                    me.detail.title = info.state
                    me.detail.subTitle = info.display
                    me.detail.contents = info.detail
                    me.detail.image = me.currentQueue.picture
                    me.detail.date = me.convertTimeStamp(me.currentQueue.timeStamp);
                    me.detail.item = me.currentQueue;
                    me.detail.show = true
                }
            },
            onOverSliderMarkLists(event, item){
                var me = this
                

                if(event.type == 'mouseleave'){
                    // me.resetDetail();
                } else if( event.type =='mouseover' ){
                    me.detail.title = me.filteredVersionLists.filter(x=>x.markIndex == item.markIndex).map(x =>x.key);
                    // me.detail.title = item.key.replaceAll('-','.');
                    me.detail.isMark = true
                    me.detail.subTitle = ``
                    me.detail.contents = ''
                    me.detail.image = item.snapshotImg;
                    me.detail.date = me.convertTimeStamp(item.timeStamp);
                    me.detail.item = item;
                    me.detail.show = true
                }
            },
            onClickMark(item){
                var me = this
                var list = JSON.parse(JSON.stringify(me.sliderLists));
                var vLists = JSON.parse(JSON.stringify(me.filteredVersionLists))
                var markItem = null;

                var version = vLists.find(queue => item.timeStamp <= queue.timeStamp);
                me.projectName = version.projectName


                if(item.timeStamp){
                    markItem = list.find(queue => item.timeStamp <= queue.timeStamp);
                }else{
                    markItem = list[0]
                }

                var moveIndex = list.findIndex(item => item.key == markItem.key);

                me.slider.current = moveIndex  == -1 ? me.slider.current  : moveIndex

            },
            async init() {
                var me = this
                try {
                    me.loading = true
                    var projectModelId = me.projectId ? me.projectId : me.$route.params.projectId

                    var information = await me.list(`db://definitions/${projectModelId}/information`);
                    me.model = information
                    me.model.projectId = projectModelId
                    me.model.uid = information.author;
                    me.model.permissions = information.permissions;

                    /*
                      초기 큐의 모든 정보를 불러와서 최소값,최대값, 리스트 정보 세팅.
                        1 2 3 4 5 6 7 ... (최신)
                    */
                    var options = {
                        sort: 'asc',
                        orderBy: null,
                        size: null,
                        startAt: null,
                        endAt: null
                    }
                    var queueLists = await me.list(`db://definitions/${me.modelProjectId}/queue`,options);
                    const queueListLength = queueLists.length - 1

                    /*
                        해당 큐의 최소값, 최대값, 큐 정보 세팅.
                     */
                    me.slider.min = 0;
                    me.slider.max = queueListLength;
                    me.sliderLists = queueLists;

                    /*
                        url 파라미터의 정보로 현재 위치 파악.
                                         없으면 최신값
                     */
                    if(me.$route.params.queueKey){
                        me.slider.current = 'null'.includes(me.$route.params.queueKey) ? queueListLength :
                            queueLists.findIndex(queue => queue.key == me.$route.params.queueKey)
                    }else{
                        me.slider.current = queueListLength;
                    }

                    /*
                        버전및 스냅샷 리스트 슬라이드 위치 표시.
                     */
                    var snapshotLists = await me.list(`db://definitions/${me.modelProjectId}/snapshotLists`);
                    var snapLists = Object.keys(snapshotLists).map(function(snapshotKey){
                        var rObj = {};
                        rObj = snapshotLists[snapshotKey];

                        rObj.key = snapshotKey
                        return rObj;
                    });

                    me.snapshotLists = snapLists;

                    // !!! Danger
                    var versionLists = await me.list(`db://definitions/${me.modelProjectId}/versionLists`);
                    if(versionLists){
                        var verLists = Object.keys(versionLists).map(function(versionKey){
                            var item = versionLists[versionKey];
                            var rObj = item.versionInfo ? item.versionInfo : {}

                            rObj.key = versionKey
                            rObj.isVersion = true
                            rObj.snapshot = item.versionValue.value;
                            rObj.lastSnapshotKey = ''
                            rObj.snapshotImg = rObj.img ? rObj.img : '';
                            rObj.timeStamp = rObj.date ? rObj.date: '';
                            rObj.projectName = rObj.projectName ?  rObj.projectName : me.projectName;
                            return rObj;
                        });
                        me.versionLists = verLists;
                    } else {
                        // No versions
                        me.versionLists = []
                    }


                    //해당 정보 세팅.
                    me.onLoad();
                } catch (e) {
                    console.log(`Error] ModelReplay : ${e}`);
                }

            },
            async onLoad(){
                var me = this

                try {
                    me.loading = true

                    // 해당 큐의 최신 위치의 스냅샷 세팅.
                    var snapshot = me.currentSnapshot.snapshot;
                    me.value = JSON.parse(snapshot);


                    // 해당 스냅부터 현재 큐까지 정보 세팅.
                    var queueLists = me.sliderLists.filter(x=> me.currentSnapshot.lastSnapshotKey < x.key && x.key <= me.currentQueueKey);

                    // version 에서 projectName
                    var vLists = JSON.parse(JSON.stringify(me.filteredVersionLists));
                    var version = vLists.find(queue => queueLists[0].timeStamp <= queue.timeStamp );
                    me.projectName = version ? version.projectName : me.projectName

                    queueLists.forEach((item) => {
                        var queueValue = item
                        var queuekey = queueValue.key
                        if (!queueValue.action.includes('user')) {
                            var queue = {
                                childKey: queuekey,
                                childValue: queueValue
                            }
                            me.receivedQueueDrawElement(queue, true)
                        }
                    });

                } catch (e) {
                    console.log(e)

                }finally {
                    me.loading = false
                }
            },
            receivedQueueDrawElement(child, ignore) {
                var me = this
                ignore = ignore ? ignore : false

                if (child != undefined) {
                    var item = null
                    var afterMove = null
                    var action = child.childValue.action ? child.childValue.action : child.childValue.state

                    if (action == 'undo' || action == 'redo') {
                        // changedByMe
                        ignore = true
                        child = JSON.parse(child.childValue.item)
                        action = child.childValue.action
                    }

                    if (action.includes('Move')) {
                        afterMove = child.childValue.after
                    } else {
                        item = child.childValue.item ? JSON.parse(child.childValue.item) : null
                    }

                    //origin
                    if (action == 'elementPush') {

                        // if (me.specVersion == '2.0') {
                        //
                        //     if (me.value.elements) {
                        //         me.$set(me.value.elements, item.elementView.id, item)
                        //     } else if (me.value.definition) {
                        //         me.value.definition.push(item)
                        //     }
                        //
                        // } else {
                            if (!ignore && child.childKey < me.prevKey) {
                                console.log('Wrong Order: elementPush ', child.childKey, 'prevKey:', me.prevKey, child)

                                // me.watch_off(`db://definitions/${me.projectId}/queue`)
                                // if( child && child.childKey ){
                                //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                                // }
                                // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                                // if(queueIds != -1){
                                //     queueFifo.removeByIndex(queueIds)
                                // }
                                // me.$emit('forceUpdateKey');
                            }

                            // Excute Element Push
                            if (ignore || child.childKey != me.prevKey) {
                                me.prevKey = child.childKey
                                //Setting added Entity ( By Queue migrate)
                                if (!item._type.endsWith('Relation')) {
                                    if (!item.description) {
                                        item.description = null
                                    }
                                    item.author = child.childValue.editUid
                                    item.rotateStatus = false
                                }
                                if (item._type.endsWith('BoundedContext')) {
                                    if (!item.preferredPlatform) item.preferredPlatform = null
                                }
                                if (item._type.endsWith('BoundedContext')) {
                                    if (!item.members) item.members = []
                                }

                                //add Element
                                me.$set(me.value.elements, item.elementView.id, item)

                                if (me.initLoad) {
                                    me.changedTemplateCode = true
                                }
                                me.$nextTick(function () {
                                    //STATUS_COMPLETE_addElementPush
                                    me.$EventBus.$emit(`${item.elementView.id}`, {
                                        action: action,
                                        STATUS_COMPLETE: true
                                    })
                                })

                            } else {
                                console.log('reduplication Element Push')
                            }

                        // }

                    } else if (action == 'elementDelete') {
                        try {

                            // if (me.specVersion == '2.0') {
                            //     var obj = {
                            //         action: 'delete',
                            //         element: JSON.stringify(item)
                            //     }
                            //     me.$nextTick(function () {
                            //         me.$EventBus.$emit(`${item.elementView.id}`, obj)
                            //     })
                            // } else {
                                me.value.elements[item.elementView.id] = null;

                                if (me.initLoad) {
                                    me.changedTemplateCode = true
                                }

                                // Changed Status
                                me.$nextTick(function () {
                                    //STATUS_COMPLETE_elementDelete
                                    me.$EventBus.$emit(`${item.elementView.id}`, {
                                        action: action,
                                        STATUS_COMPLETE: true
                                    })
                                })
                            // }

                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)

                            // me.watch_off(`db://definitions/${me.projectId}/queue`)
                            // if( child && child.childKey ){
                            //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                            // }
                            // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            // if(queueIds != -1){
                            //     queueFifo.removeByIndex(queueIds)
                            // }
                            // me.$emit('forceUpdateKey');
                        }

                    } else if (action == 'elementMove') {

                        try {
                            var elementId = child.childValue.elementId
                            var isHexagonal = child.childValue && child.childValue.isHexagonal ? true : false

                            var obj = {
                                action: 'elementMove',
                                element: afterMove,
                            }

                            me.onMoveElementById(elementId, afterMove, isHexagonal)

                            // Changed Status
                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${elementId}`, {action: action})
                            })


                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)

                            // me.watch_off(`db://definitions/${me.projectId}/queue`)
                            // if( child && child.childKey ){
                            //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                            // }
                            // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            // if(queueIds != -1){
                            //     queueFifo.removeByIndex(queueIds)
                            // }
                            // me.$emit('forceUpdateKey');
                        }


                    } else if (action == 'valueModify') {
                        try {
                            //changedByMe
                            if (!ignore && me.changedByMeKeys.includes(child.childKey)) {
                                me.changedByMeKeys.splice(me.changedByMeKeys.indexOf(child.childKey), 1)
                                if (me.initLoad) {
                                    me.changedTemplateCode = true
                                }

                            } else {
                                jsondiffpatch.patch(me.value, item)

                                if (me.initLoad) {
                                    me.changedTemplateCode = true
                                }
                            }

                        } catch (e) {
                            try {
                                //null value ignore
                                var location = Object.keys(item)[0]
                                var itemKey = Object.keys(item[location])[0]
                                if (me.value[location][itemKey]) {
                                    jsondiffpatch.patch(me.value, item)
                                }
                            } catch (e) {
                                console.log('patchError:', e, child.childKey, JSON.parse(JSON.stringify(me.value)), JSON.parse(child.childValue.item))
                                // me.watch_off(`db://definitions/${me.projectId}/queue`)
                                // if( child && child.childKey ){
                                //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                                // }
                                // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                                // if(queueIds != -1){
                                //     queueFifo.removeByIndex(queueIds)
                                // }
                                // me.$emit('forceUpdateKey');
                            }

                        }

                    } else if (action == 'relationPush') {

                        // var item = JSON.parse(child.childValue.item)
                        // if (me.specVersion == '2.0') {
                        //
                        //     if (me.value.relations) {
                        //         me.$set(me.value.relations, item.relationView.id, item)
                        //     } else if (me.value.relation) {
                        //         me.value.relation.push(item);
                        //     }
                        //
                        // } else {
                            if (!ignore && child.childKey < me.prevKey) {
                                console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)

                                // me.watch_off(`db://definitions/${me.projectId}/queue`)
                                // if( child && child.childKey ){
                                //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                                // }
                                // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                                // if(queueIds != -1){
                                //     queueFifo.removeByIndex(queueIds)
                                // }
                                // me.$emit('forceUpdateKey');
                            }

                            if (ignore || child.childKey != me.prevKey) {
                                me.prevKey = child.childKey

                                if (me.validateRelation(item.from, item.to)) {

                                    if (!item._type.endsWith('Relation')) {
                                        item.author = child.childValue.editUid
                                    }

                                    me.$set(me.value.relations, item.relationView.id, item)

                                    if (me.initLoad) {
                                        me.changedTemplateCode = true
                                    }

                                    me.$nextTick(function () {
                                        //STATUS_COMPLETE_addElementPush
                                        me.$EventBus.$emit(`${item.relationView.id}`, {
                                            action: action,
                                            STATUS_COMPLETE: true
                                        })
                                    })
                                }


                            } else {
                                console.log('reduplication Relation Push')
                            }
                        // }


                    } else if (action == 'relationDelete') {

                        try {
                            // if (me.specVersion == '2.0') {
                            //     var obj = {
                            //         action: 'delete',
                            //         element: JSON.stringify(item)
                            //     }
                            //     me.$nextTick(function () {
                            //         me.$EventBus.$emit(`${item.relationView.id}`, obj)
                            //     })
                            // } else {
                                me.value.relations[item.relationView.id] = null;

                                if (me.initLoad) {
                                    me.changedTemplateCode = true
                                }

                                me.$nextTick(function () {
                                    //STATUS_COMPLETE_relationDelete
                                    me.$EventBus.$emit(`${item.relationView.id}`, {
                                        action: action,
                                        STATUS_COMPLETE: true
                                    })
                                })

                            // }
                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)

                            // me.watch_off(`db://definitions/${me.projectId}/queue`)
                            // if( child && child.childKey ){
                            //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                            // }
                            // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            // if(queueIds != -1){
                            //     queueFifo.removeByIndex(queueIds)
                            // }
                            // me.$emit('forceUpdateKey');
                        }


                    } else if (action == 'relationMove') {

                        try {
                            var relatinId = child.childValue.relationId
                            var isHexagonal = child.childValue && child.childValue.isHexagonal ? true : false

                            var obj = {
                                action: 'relationMove',
                                element: afterMove
                            }

                            me.onMoveRelationById(relatinId, afterMove, isHexagonal)

                            me.$nextTick(function () {
                                me.$EventBus.$emit(`${relatinId}`, obj)
                            })

                        } catch (e) {
                            console.log('Wrong Order', 'now', child.childKey, 'prev:', me.prevKey, child)

                            // me.watch_off(`db://definitions/${me.projectId}/queue`)
                            // if( child && child.childKey ){
                            //     me.delete(`db://definitions/${me.projectId}/queue/${child.childKey}`)
                            // }
                            // var queueIds = queueFifo.findIndexByChildKey(child.childKey)
                            // if(queueIds != -1){
                            //     queueFifo.removeByIndex(queueIds)
                            // }
                            // me.$emit('forceUpdateKey');
                        }
                    }
                }
            },
            async openCodeViewer() {
                var me = this

                try {
                    me.user.accessToken = localStorage.getItem('gitAccessToken')
                    me.openSeparatePanel();
                } catch (e) {
                    console.error(e)
                    alert('openCodeViewer:: ', e)
                    return false
                }
            },
            openSeparatePanel(){
                var me = this
                var separatePanel = localStorage.getItem("separatePanel")
                if(separatePanel) {
                    var separatePanelInfo = JSON.parse(separatePanel)
                    me.mainSeparatePanel.current = me.mainSeparatePanel.max < separatePanelInfo.mainSeparatePanel ? 50 : separatePanelInfo.mainSeparatePanel
                } else {
                    me.mainSeparatePanel.current = 30
                }
            },
            closeSeparatePanel(){
                var me = this

                var separatePanel = localStorage.getItem("separatePanel")
                var separatePanelInfo = {}
                if(separatePanel){
                    separatePanelInfo = JSON.parse(separatePanel);
                    separatePanelInfo.mainSeparatePanel =  me.mainSeparatePanel.current
                } else {
                    separatePanelInfo['mainSeparatePanel'] = me.mainSeparatePanel.current
                }
                var objString = JSON.stringify(separatePanelInfo)
                me.putObject(`localstorage://separatePanel`, objString)

                me.mainSeparatePanel.current = 100
            },
            elementComment(queue) {
                var me = this
                var comment = {
                    state: '',
                    display: '',
                    detail: ''
                }
                var action = queue.action
                var item = queue.item ? JSON.parse(queue.item) : queue



                if (action.includes('undo') || action.includes('redo')) {
                    var undoDiff = JSON.parse(queue.value.item)
                    item = undoDiff.childValue.item ? JSON.parse(undoDiff.childValue.item) : undoDiff.childValue
                    action = JSON.parse(queue.value.item).childValue.action
                }

                if (action.includes('relation')) {

                    if (action.includes('Push')) {

                        var source = item.sourceElement
                        var target = item.targetElement

                        comment.state = 'Create'
                        comment.display = '[선] \"' + source.name + ' \" [ ' + source._type.split('.')[4] + ' ] -> \"' + target.name + ' \" [ ' + target._type.split('.')[4] + ' ]' + '를 연결합니다.'
                        comment.detail = ''


                    } else if (action.includes('Delete')) {

                        var source = item.sourceElement
                        var target = item.targetElement

                        comment.state = 'Delete'
                        comment.display = '[선] \"' + source.name + ' \" [ ' + source._type.split('.')[4] + ' ] ->\"' + target.name + ' \" [ ' + target._type.split('.')[4] + ' ]' + '를 삭제 합니다.'
                        comment.detail = ''

                    } else if (action.includes('Move')) {

                        var relation = me.value.relations[item.relationId]
                        comment.state = 'Move'
                        if (relation) {
                            var source = relation.sourceElement
                            var target = relation.targetElement
                            comment.display = '[선] \" ' + source.name + '\" [' + source._type.split('.')[4] + '] ->  \" ' + source.name + '\" [' + source._type.split('.')[4] + '] 이동 합니다.'
                            comment.detail = ''
                        } else {
                            comment.display = '[선] 이동합니다.'
                            comment.detail = ''
                        }

                    } else if (action.includes('Modify')) {
                        comment.display = '준비중 입니다.'
                        comment.detail = ''
                    }

                } else {
                    if (action.includes('Push')) {

                        comment.state = 'Create'
                        comment.display = '\"' + item.name + ' \" 인[ ' + item._type.split('.')[4] + ' ]를 추가 합니다.'
                        comment.detail = 'X좌표: ' + item.elementView.x + '/ Y좌표: ' + item.elementView.y

                    } else if (action.includes('Delete')) {
                        comment.state = 'Delete'
                        comment.display = '\"' + item.name + ' \" 인[ ' + item._type.split('.')[4] + ' ]를 삭제 합니다.'
                        comment.detail = 'X좌표: ' + item.elementView.x + '/ Y좌표: ' + item.elementView.y

                    } else if (action.includes('Move')) {

                        comment.state = 'Move'
                        comment.display = '\" ' + item.elementName + '\"인 [ ' + item.elementType + ' ]가 이동 합니다.'
                        comment.detail = '[ X: ' + JSON.parse(item.before).x + '/ Y: ' + JSON.parse(item.before).y + '] \n'
                            + ' => [ X: ' + JSON.parse(item.after).x + '/ Y: ' + JSON.parse(item.after).y + '] \n'

                    } else if (action.includes('Modify')) {
                        var diff = item
                        var id = Object.keys(diff.elements)[0]
                        // var copyValue = JSON.parse(JSON.stringify(me.value))
                        var copyValue = me.value
                        var elementName = copyValue.elements[id] ? copyValue.elements[id].name : ''
                        var elementType = copyValue.elements[id] ? copyValue.elements[id]._type.split('.')[4] : ''

                        var diffParse = me.getDiffValues(diff)
                        comment.state = 'Modify'
                        comment.display = '\"' + elementName + ' \"인 [ ' + elementType + ' ]를 수정 합니다. '

                        Object.entries(diffParse.changed).forEach(function (key) {
                            if (typeof key[1] == 'object' && !Array.isArray(key[1])) {
                                comment.detail = comment.detail + key[0] + ', '
                            } else if (Array.isArray(key[1])) {
                                comment.detail = comment.detail + '[' + key[0] + ': ' + key[1][0] + ' -> ' + key[1][1] + '], '
                            } else {
                                comment.detail = comment.detail + ''
                            }
                        })
                        comment.detail = comment.detail + ' 변경되었습니다.'
                    } else if( action.includes('user')){
                        comment.state = 'User Status'
                        if(action.includes('Exit')){
                            comment.display = `USER(${item.userName}) has left.`
                        } else {
                            comment.display = `USER(${item.userName}) entered.`
                        }
                        comment.detail = ''
                    }
                }


                return comment
            },
            onMoveRelationById(id, newValueObj) {
                var me = this

                if (me.value && me.value.relations && me.value.relations[id]) {
                    // minus relation
                    me.value.relations[id].relationView.value = newValueObj.includes('-') ? newValueObj.replaceAll('-','') : newValueObj
                }
            },
            onMoveElementById(id, newValueStr) {
                var me = this

                if (me.value && me.value.elements && me.value.elements[id]) {
                    var newValueObj = JSON.parse(newValueStr)
                    // minus element
                    newValueObj.x =  newValueObj.x < 0 ? Math.abs(newValueObj.x) : newValueObj.x
                    newValueObj.y =  newValueObj.y < 0 ? Math.abs(newValueObj.y) : newValueObj.y
                    me.value.elements[id].elementView.x = newValueObj.x
                    me.value.elements[id].elementView.y = newValueObj.y
                    me.value.elements[id].elementView.width = newValueObj.width
                    me.value.elements[id].elementView.height = newValueObj.height
                }
            },
            markStyle(mark){
                var me = this
                var queueListLength = me.sliderLists.length - 1;

                var cal = ( ( Math.abs(mark.markIndex)/Math.abs(queueListLength) ) * 100 )
                cal = Number(cal);
                cal = (cal).toFixed(1);

                if( cal < 0){
                    cal = 0
                }
                else if( 99 < cal){
                    cal = 97.7
                }
                return {position: 'absolute', left: `${ cal }%`,'z-index': 2, top: '25px', left: '5px',};
            },
            changeUrl(url) {
                if (typeof (history.pushState) != "undefined") { //브라우저가 지원하는 경우
                    history.pushState(null, null, url);
                } else {
                    location.href = url; //브라우저가 지원하지 않는 경우 페이지 이동처리
                }
            },
            copyURL(){
                var me = this

                var url = `${window.location.origin}/#/storming/${me.modelProjectId}:${me.detail.item.key}`

                const t = document.createElement("textarea");
                document.body.appendChild(t);
                t.value = url;
                t.select();
                document.execCommand('copy');
                // remove
                document.body.removeChild(t);
                // this.$EventBus.$emit('snackbar', {show :true, text : 'Copied to clipboard!', timeout: 1000 ,bottom: true })
            },
            convertTimeStamp(timeStamp){
                if(timeStamp){
                    var date = new Date(timeStamp);
                    return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분 " + date.getSeconds() + "초"
                }
                return null;
            },
            bindEvents: function (opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
                this.canvas = opengraph.canvas;
                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start: function () {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height'),
                            'description': $(this).attr('_description'),
                            'label': $(this).attr('_label')
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });
            },

        }
    }
</script>
