<template>
  <div>
    <!-- 버전관리 시작 -->
<!--    <md-button class="md-fab md-fab-top-right" id="fab" @click.native="openDialog('versionManager');"-->
<!--               v-if="versions && versions.length > 0" v-model="selectedVersion">-->
<!--      <md-icon>restore</md-icon>-->
<!--    </md-button>-->
<!--    <md-dialog md-open-from="#fab" md-close-to="#fab" ref="versionManager">-->
<!--      <md-dialog-title>Version Manager</md-dialog-title>-->

<!--      <md-dialog-content>-->
<!--        <version-manager :backend="backend"></version-manager>-->
<!--      </md-dialog-content>-->

<!--      <md-dialog-actions>-->
<!--        <md-button class="md-primary" @click.native="closeDialog('versionManager')">Close</md-button>-->
<!--      </md-dialog-actions>-->
<!--    </md-dialog>-->
    <!-- 버전 관리 끝 -->

    <!-- 삭제 다이얼로그 시작 -->
    <md-dialog md-open-from="#fab" md-close-to="#fab" ref="deleteDialog">
      <md-dialog-title v-if="selectedCard">{{selectedCard.name}}을 삭제하시겠습니까?</md-dialog-title>
      <md-dialog-title v-if="!selectedCard">삭제하시겠습니까?</md-dialog-title>

      <md-dialog-actions>
        <md-button class="md-primary"
                   @click.native="deleteDefinition(selectedCard.name); closeDialog('deleteDialog')">
          예
        </md-button>
        <md-button class="md-primary" @click.native="closeDialog('deleteDialog')">아니요</md-button>
      </md-dialog-actions>
    </md-dialog>
    <!-- 삭제 다이얼로그 끝-->

    <!--New Source Fab start-->
    <md-speed-dial md-open="hover" md-direction="left" class="md-fab-top-right" md-theme="purple"
                   style="float: right; right: 100px;">

      <md-button class="md-fab" md-fab-trigger>
        <md-icon md-icon-morph>add</md-icon>
        <md-icon>add</md-icon>
      </md-button>

      <md-button class="md-fab md-primary md-mini md-clean" v-on:click="newProcess">
        <md-tooltip md-direction="right">New Process</md-tooltip>
        <md-icon>label</md-icon>
      </md-button>
      <md-button class="md-fab md-primary md-mini md-clean" v-on:click="newClass">
        <md-tooltip md-direction="right">New Class</md-tooltip>
        <md-icon>device_hub</md-icon>
      </md-button>
      <md-button class="md-fab md-primary md-mini md-clean" v-on:click="newPractice">
        <md-tooltip md-direction="right">New Practice</md-tooltip>
        <md-icon>slideshow</md-icon>
      </md-button>
      <md-button class="md-fab md-primary md-mini md-clean" v-on:click="newFolder">
        <md-tooltip md-direction="right">New Folder</md-tooltip>
        <md-icon>folder</md-icon>
      </md-button>

    </md-speed-dial>
    <!--New Source Fab end-->

    <!--drag & drop breadcrumb start-->
    <!--<md-layout>-->
      <!--<ul class="breadcrumb">-->
        <!--<li v-for="item in breadcrumb" @dragover.prevent @drop="drop(item)">-->
            <!--<span v-on:click="selectFolder(item.path)"-->
                  <!--@dragleave="onDragLeave()"-->
                  <!--@dragenter="onDragenter(item)"-->
                  <!--@mouseover="navigationName = item.name" @mouseout="navigationName = ''"-->
                  <!--class="breadcrumb-list"-->
                  <!--:class="{ 'breadcrumb-list-hover' : item.name == navigationName}">-->
              <!--{{item.name}}-->
            <!--</span>-->
        <!--</li>-->
      <!--</ul>-->
    <!--</md-layout>-->
    <!--drag & drop breadcrumb end-->


    <div class="side-margin">
      <md-layout v-if="directory.length > 0">
        {{ $t("message['title.desinger.package']") }}
      </md-layout>

      <!--drag & drop folder-card start-->
      <md-layout>
        <md-layout md-gutter="24">
          <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="25" md-flex="25"
                     v-for="item in directory"
                     draggable="true"
                     @dragstart.native="dragover(item)"

                     @drop.native="drop(item)"
                     @dragleave.native="onDragLeave()"
                     @dragenter.native="onDragenter(item)"
          >
            <md-card class="folder-card" @dblclick.native="selectFolder(item.path)"
                     :class="{ 'folder-hover' : item.name == folderName }">
              <md-card-header>
                <md-card-header-text class="ellipsis">
                  <md-icon class="folder-icon">folder</md-icon>
                  <span class="folder-title">{{ item.name }}</span>
                  <md-menu md-direction="bottom-end">
                    <md-icon class="folder-menu" md-menu-trigger>more_vert</md-icon>
                    <md-menu-content>

                      <md-menu-item
                        @click.native="sourcePath = item.path; sourceName = item.name; $refs['update'].open()">
                        <span>{{ $t("message['button.rename']") }}</span>
                        <md-icon>edit</md-icon>
                      </md-menu-item>
                      <md-menu-item
                        @click.native="sourcePath = item.path; sourceName = item.name; $refs['move'].open();">
                        <span>{{ $t("message['button.move']") }}</span>
                        <md-icon>folder_open</md-icon>
                      </md-menu-item>
                      <md-menu-item @click.native="sourcePath = item.path; $refs['delete'].open()">
                        <span>{{ $t("message['button.delete']") }}</span>
                        <md-icon>delete</md-icon>
                      </md-menu-item>
                    </md-menu-content>
                  </md-menu>
                </md-card-header-text>
              </md-card-header>
            </md-card>
          </md-layout>
        </md-layout>
      </md-layout>
      <!--drag & drop folder-card end-->

      <md-layout v-if="cards.length > 0">{{ $t("message['title.desinger.process']") }}</md-layout>
      <md-layout mo-gutter>
        <md-layout md-gutter="24">
          <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="25" md-flex="25"
                     v-for="card in cards"
                     :key="card.name"
                     draggable="true"
                     @dragstart.native="dragover(card)"
          >
            <md-card md-with-hover>
              <md-card-area>
                <md-card-media>
                  <img :src="card.src">
                </md-card-media>

                <md-card-header>
                  <div class="md-title">{{card.name.split(".")[0]}}</div>
                </md-card-header>

                <md-card-content>
                  {{card.desc}}
                </md-card-content>
              </md-card-area>

              <md-card-actions>
                <md-button v-on:click="initiateProcess(card)">{{ $t("message['button.activate']") }}</md-button>
                <md-button v-on:click="editProcess(card)">{{ $t("message['button.edit']") }}</md-button>
              </md-card-actions>
              <md-card-actions>
                <md-button @click.native="sourcePath = card.path; sourceName = card.name; $refs['move'].open();">
                  {{ $t("message['button.move']") }}
                </md-button>
                <md-button v-on:click="selectedCard = card; openDialog('deleteDialog')">{{
                  $t("message['button.delete']") }}
                </md-button>
              </md-card-actions>
            </md-card>
          </md-layout>
        </md-layout>
      </md-layout>
    </div>


    <!-- Move Form -->
    <md-dialog md-open-from="#fab" md-close-to="#fab" ref="move">
      <md-dialog-title>{{ $t("message['title.desinger.package.move']") }}</md-dialog-title>
      <md-dialog-content>
        <md-input-container>
          <label>{{ $t("message['message.package.list']") }}</label>
          <md-select v-model="targetPackagePath" class="select-option">

            <!--parent paths (ignore current path)-->
            <!--<md-option v-if="currentPath !== package.path"-->
                       <!--v-for="package in breadcrumb" :value="package.path">-->
              <!--<span class="package-name">{{package.name}}</span>-->
            <!--</md-option>-->

            <!--just display current path as none select -->
            <md-subheader v-if="currentPath == ''" class="package-title">Home</md-subheader>
            <md-subheader v-if="currentPath !== ''" class="package-title">
              {{currentPath.substring(currentPath.lastIndexOf("/")+1, currentPath.length)}}
            </md-subheader>

            <!--child paths-->
            <md-option v-for="package in directory" :value="package.path">
              <md-icon class="fa fa-angle-right"></md-icon>
              <span class="package-name">{{package.name}}</span>
            </md-option>
          </md-select>
        </md-input-container>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click.native="moveClose(); $refs['move'].close()">{{ $t("message['button.move']")
          }}
        </md-button>
        <md-button class="md-primary" @click.native="$refs['move'].close()">{{ $t("message['button.close']") }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Insert Form -->
    <md-dialog md-open-from="#fab" md-close-to="#fab" ref="create">
      <md-dialog-title>{{ $t("message['title.desinger.new.package']") }}</md-dialog-title>
      <md-dialog-content>
        <md-input-container>
          <label>{{ $t("message['title.desinger.package.name']") }}</label>
          <md-input v-model="newFolderName" type="text"></md-input>
        </md-input-container>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click.native="insertClose(); $refs['create'].close()">{{
          $t("message['button.create']") }}
        </md-button>
        <md-button class="md-primary" @click.native="$refs['create'].close()">{{ $t("message['button.close']") }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Update Form -->
    <md-dialog md-open-from="#fab" md-close-to="#fab" ref="update">
      <md-dialog-title>{{ $t("message['title.desinger.rename.package']") }}</md-dialog-title>
      <md-dialog-content>
        <md-input-container>
          <label>{{ $t("message['title.desinger.package.name']") }}</label>
          <md-input v-model="sourceName" type="text"></md-input>
        </md-input-container>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click.native="updateClose(); $refs['update'].close()">{{
          $t("message['button.rename']") }}
        </md-button>
        <md-button class="md-primary" @click.native="$refs['update'].close()">{{ $t("message['button.close']") }}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Delete Confirm -->
    <md-dialog-confirm
      :md-title="dc.title"
      :md-content-html="dc.contentHtml"
      :md-ok-text="dc.ok"
      :md-cancel-text="dc.cancel"
      @close="deleteClose"
      ref="delete">
    </md-dialog-confirm>

    <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
  </div>
</template>
<script>
  export default {
    props: {
      backend: Object,
      iam: Object,
      path: String
    },
    data() {
      return {
        versions: [],
        cards: [],
        directory: [],
        treeData: {
          name: 'Package List',
          children: []
        },
        processName: "",
        draggableItem: null,
        folderName: "",
        navigationName: "",
        sourcePath: '',
        sourceName: '',
        selectedCard: {},
        targetPackagePath: '',
        newFolderName: ''
      }
    },
    created: function () {
      this.dc = {
        title: 'Delete Package',
        contentHtml: '패키지를 삭제하면 패키지에 속한 프로세스도 함께 삭제됩니다. \<br /\> 패지키를 삭제하시겠습니까?',
        cancel: 'Close',
        ok: 'Delete',
      };
    },
    mounted() {
      var me = this;
      $('.scroll-inner').slimScroll({
        height: '100%'
      });
      this.getDefinitionList();
    },
    watch: {
      '$route'(to, from) {
        this.getDefinitionList();
      }
    },
    computed: {
      currentPath: function () {
        return this.path ? this.path : ''
      },
      currentFullPath: function () {
        return this.path ? '/' + this.path : ''
      },
      newDefinitionName: function () {
        return this.currentPath.replace(/\//g, "-");
      },
      // breadcrumb: function () {
      //   var breadcrumb = [
      //     {
      //       name: 'Root',
      //       path: ''
      //     }
      //   ];
      //   if (this.path) {
      //     var split = this.path.split('/');
      //     var path = '';
      //     split.forEach(function (value, index) {
      //       if (index > 0) {
      //         path = path + '/' + value;
      //       } else {
      //         path = value;
      //       }
      //       breadcrumb.push({
      //         name: value,
      //         path: path
      //       })
      //     })
      //   }
      //   return breadcrumb;
      // },
      unHover: function () {
        var me = this;
        me.folderName = "";
        me.navigationName = "";
        //해당 콘솔을 지워버리면 folder 상태가 hover 상태에서 풀리지 않습니다.
        //콘솔을 지우지 말아주세요.
        // console.log('focus was fade out', me.folderName);
      },
    },
    methods: {
      dragover: function (item) {
        var me = this;
        me.draggableItem = item;
      },
      onDragenter: function (item) {
        var me = this;
        me.folderName = item.name;
        me.navigationName = item.name;
      },
      onDragLeave: function () {
        var me = this;
        if (event.fromElement) {
          var parent = event.fromElement.parentElement.className;
          if (parent.match("md-layout") != null) {
            me.folderName = "";
          }
        }
        me.navigationName = "";
      },
      /**
       * 아이템이 드랍되었을 때 소스를 이동시킨다.
       */
      drop: function (item) {
        var me = this;
        var src = 'definition/' + me.draggableItem.path;
        var targetPath = item.path + "/" + me.draggableItem.name;
        if (targetPath.indexOf('/') == 0) {
          targetPath = targetPath.substring(1, targetPath.length);
        }
        this.moveSource(src, targetPath);
      },
      /**
       * 주어진 리소스 패스로 라우터를 이동한다.
       */
      selectFolder: function (path) {
        this.$router.push({
          path: '/designer/' + path
        })
      },
      /**
       * 현재 폴더 위치의 리소스들을 불러온다.
       */
      getDefinitionList: function () {
        var me = this;
        var definitions = [];
        var url = "definition";
        if (me.currentPath && me.currentPath.length) {
          url = url + '/' + me.currentPath;
        }
        me.backend.$bind(url, definitions);

        var cards = [];
        var folders = [];

        definitions.$load().then(function (definitions) {

          if (definitions) {
            definitions.forEach(function (definition) {
              if (definition.directory) {
                folders.push(definition);
              } else {
                //path
                definition.desc = name + '...';
                //localStorage['svg-' + me.id];

                var svgData = me.$refs['modeler-image-generator'].load(definition.path.replace('.xml', '').replace('.json', ''));
                if (svgData) {
                  //definition.src = 'data:image/svg+xml;utf-8,' + svgData;
                  definition.src = svgData;
                } else {
                  definition.src = '/static/image/sample.png';
                }
                cards.push(definition);
              }
            });
          }
        });

        //localStorage['svg-' + me.id] = svgData;
        me.directory = folders;
        me.cards = cards;
      },
      openDialog: function (ref) {
        // console.log(this.iam)
        this.$refs[ref].open();
      },``
      closeDialog: function (ref) {
        this.$refs[ref].close();
      },
      newProcess: function () {
        this.$router.push({
          path: '/process-definition'
        })
      },
      newClass: function () {
        this.$router.push({
          path: '/class-definition'
        })
      },
      newPractice: function () {
        this.$router.push({
          path: '/practice'
        })
      },
      newFolder: function () {
        this.newFolderName = '';
        this.$refs['create'].open();
      },
      /**
       * 프로세스 데피니션 편집창으로 이동한다.
       */
      editProcess: function (card) {
        this.$router.push({
          path: '/definition' + this.currentFullPath + '/' + card.name.replace('.xml', '')
        })
      },
      /**
       * 프로세스 데피니션 또는 폴더를 타겟 패스로 이동시킨다.
       */
      moveSource: function (sourceSrc, targetPath) {
        sourceSrc = sourceSrc.replace(".xml", ".json");

        var me = this;
        var packages = {path: targetPath};
        me.backend.$bind(sourceSrc, packages);
        packages.$save().then(
          function (response) {
            me.$root.$children[0].success('이동되었습니다.');
            me.getDefinitionList();
            me.unHover;
          },
          function (response) {
            me.$root.$children[0].error('이동할 수 없습니다.');
            me.unHover;
          }
        );
      },
      /**
       * 프로세스 데피니션을 삭제한다.
       */
      deleteDefinition: function (cardName) {
        var me = this;
        var definitions = [];
        var url = "definition" + me.currentFullPath + "/" + cardName;
        me.backend.$bind(url, definitions);

        definitions.$delete().then(function () {
          me.$root.$children[0].success('리소스가 삭제되었습니다.');
          me.getDefinitionList();
        });
      },
      /**
       * 프로세스를 시작한다.
       */
      initiateProcess: function (card) {
        var me = this;
        card.instantiation.$create(null, {"simulation": false})
          .then(
            function (instance) {
              var instanceId = instance.instanceId;
              me.$root.$children[0].success('프로세스가 시작되었습니다.');
              me.$router.push({
                path: '/instance/' + instanceId + '/' + instanceId
              })
            },
            function (response) {
              me.$root.$children[0].error('프로세스를 시작할 수 없습니다.');
            }
          );
      },
      /**
       * 이동 폼을 완료할 때 호출된다.
       */
      moveClose: function () {
        var me = this;
        var src = "definition/" + me.sourcePath;
        var targetPath = me.targetPackagePath + '/' + me.sourceName;

        //path 값의 앞에 / 가 붙을 경우 uengine5에서 제공하는 API에 어긋나는 path 값이 들어가게 된다.
        //따라서, /의 위치를 확인하고 맨 앞에 올 시 잘라내줘야 한다.
        if (targetPath.indexOf('/') == 0) {
          targetPath = targetPath.substring(1, targetPath.length);
        }

        // console.log('moveClose', src, targetPath);
        this.moveSource(src, targetPath);
      },
      /**
       * 신규 폴더 폼을 완료할 때 호출된다.
       */
      insertClose: function () {
        var me = this;
        var path = me.currentPath;
        if (path != '') {
          path += '/';
        }
        var packages = [];
        me.backend.$bind('definition', packages);
        packages.$create({
          name: path + me.newFolderName,
          directory: true
        }).then(
          function (response) {
            me.$root.$children[0].success('저장되었습니다.');
            me.getDefinitionList();
          },
          function (response) {
            me.$root.$children[0].error('저장할 수 없습니다.');
          }
        );
      },
      /**
       * 이름 변경 폼을 완료할 때 호출된다.
       */
      updateClose: function () {
        var me = this;
        var oldPath = me.sourcePath
        var rename = me.sourceName;
        var src = 'definition/' + oldPath;
        var split = oldPath.split('/');
        var newPath = "";

        for (var i = 0; i < split.length; i++) {
          if (i + 1 == split.length) {
            newPath += rename;
          } else {
            newPath += split[i] + "/";
          }
        }
        var packages = {path: newPath};
        me.backend.$bind(src, packages);
        packages.$save().then(
          function (response) {

            me.$root.$children[0].success('변경되었습니다.');
            me.getDefinitionList(me.current);
          },
          function (response) {
            me.$root.$children[0].error('변경할 수 없습니다.');
          }
        );
      },
      /**
       * 삭제 폼을 완료할 때 호출된다.
       * @param type
       */
      deleteClose: function (type) {
        if (type == 'ok') {
          var me = this;
          var src = 'definition/' + me.sourcePath;
          var packages = [];
          me.backend.$bind(src, packages);
          packages.$delete().then(
            function (response) {
              me.$root.$children[0].success('삭제되었습니다.');
              me.getDefinitionList(me.current);
            },
            function (response) {
              me.$root.$children[0].error('삭제할 수 없습니다.');
            }
          );
        }
      },
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .package-name {
    font-size: 15px;
  }

  .package-title {
    font-size: 15px;
  }

  .md-layout {
    margin-bottom: 5px;
    margin-top: 5px;
  }

  .side-margin {
    margin: 15px;
  }

  .md-theme-default .folder-card {
    width: 100%;
    height: 80%;
    cursor: pointer
  }

  .md-theme-default .folder-hover {
    background-color: #3f51b5;
    color: #ffffff;
    .folder-icon {
      color: #ffffff;
    }
    .md-menu .folder-menu {
      align: right;
      color: #ffffff;
      position: absolute;
      top: 15px;
      right: 0px;
    }
  }

  .ellipsis {
    height: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .folder-icon {
    color: #9a9a9a;
  }

  .folder-title {
    font-size: 12pt;
  }

  .md-menu .folder-menu {
    align: right;
    color: #9a9a9a;
    position: absolute;
    top: 15px;
    right: 0px;
  }

  /*!*** Breadcrumbs ***!*/
  /*!* Style the list *!*/
  /*ul.breadcrumb {*/
    /*padding: 0px;*/
    /*margin-bottom: 10px;*/
    /*list-style: none;*/
  /*}*/

  /*!* Display list items side by side *!*/
  /*ul.breadcrumb li {*/
    /*display: inline;*/
    /*font-size: 14px;*/
  /*}*/

  /*!* Add a slash symbol (/) before/behind each list item *!*/
  /*ul.breadcrumb li + li:before {*/
    /*color: black;*/
    /*content: ">\00a0";*/
  /*}*/

  /*ul.breadcrumb li:last-child {*/
    /*color: black;*/
    /*font-weight: bolder;*/
  /*}*/

  /*!* Add a color to all links inside the list *!*/
  /*ul.breadcrumb li .breadcrumb-list {*/
    /*cursor: pointer;*/
    /*padding: 15px;*/
  /*}*/

  /*ul.breadcrumb li .breadcrumb-list-hover {*/
    /*color: #ffffff;*/
    /*background-color: #3f51b5;*/
    /*border-radius: 10px;*/
  /*}*/

  /** move select box */
  .select-option {
    width: 250px;
  }

</style>
