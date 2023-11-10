<template>
  <canvas style="display: none" ref="image-gen"></canvas>
</template>
<script>
  export default {
    data() {
      return {
        value: null
      }
    },
    watch: {
      path: function (val) {
        this.load();
      }
    },
    computed: {},
    mounted() {

    },
    methods: {
      load: function (id) {
        return localStorage['svg-' + id];
      },
      save: function (id, canvas) {

        var me = this;
        if (!canvas) {
          return;
        }
        //save image to localstorage
        var svg = canvas._RENDERER.getRootElement();
        var svgData = new XMLSerializer().serializeToString(svg);

        function drawInlineSVG(instanceCanvas, rawSVG, callback) {

          var ctx = instanceCanvas.getContext("2d");
          var svg = new Blob([rawSVG], {type: "image/svg+xml;charset=utf-8"}),
            domURL = self.URL || self.webkitURL || self,
            url = domURL.createObjectURL(svg),
            img = new Image;

          img.onload = function () {
            instanceCanvas.width = 2000;
            instanceCanvas.height = 1000;

            try {
              //JavaScript syntax:	context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
              // img:	Specifies the image, canvas, or video element to use
              // sx:	Optional. The x coordinate where to start clipping
              // sy:	Optional. The y coordinate where to start clipping
              // swidth:	Optional. The width of the clipped image
              // sheight:	Optional. The height of the clipped image
              // x:	The x coordinate where to place the image on the canvas
              // y:	The y coordinate where to place the image on the canvas
              // width:	Optional. The width of the image to use (stretch or reduce the image)
              // height:	Optional. The height of the image to use (stretch or reduce the image)

              ctx.drawImage(img, 0, 0, 2000, 1000, 0, 0, 2000, 1000);
              domURL.revokeObjectURL(url);
              callback(this);
              $(img).remove();

              return instanceCanvas.toDataURL();
            } catch (e) {
              $(img).remove();
            }
          };
          img.src = url;

        }

        return new Promise(function (resolve, reject) {
            var instanceCanvas = me.$refs['image-gen'];
            drawInlineSVG(instanceCanvas, svgData, function () {
                //canvas.toDataURL() -> PNG data-uri
                resolve(instanceCanvas.toDataURL());

                // console.log("image 생성")
            });
        })
      }



    }
  }
</script>

