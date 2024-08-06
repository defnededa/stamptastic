document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  let counter = 1;
  let main_canvas_side = window.innerWidth/1.8 - window.innerWidth / 10;
  
  let pixelcolor;
  let is_opaque;

  function sketcher(ref, callback) {
    let functionName = "sketch" + counter;
    counter++;

    window[functionName] = (p) => {
      p.setup = function () {
        p.createCanvas(main_canvas_side / 2, main_canvas_side / 2);
        //p.background(255);
        p.canvas.addEventListener("touchstart", handleTouch);
        p.canvas.addEventListener("touchmove", handleTouch);
        p.canvas.addEventListener("touchend", handleTouch);
      };
      p.draw = function () {
        // Drawing logic will be handled dynamically
      };

      p.mouseDragged = () => callback(p); //change all the pointer move pointer down etc
      p.mousePressed = () => callback(p);
      p.mouseReleased = () => callback(p);

      function handleTouch(event) {
        event.preventDefault(); // Prevent scrolling
        callback(p);
      }

      if (typeof callback === "function") {
        callback(p);
      }
    };

    new p5(window[functionName], ref);
  }

  new Vue({
    el: "#app",
    template: `
    <div id="app">
    
    <div class="canvas-holder">

      <div class="canvas-holder-3">
      

      <div class="buttons-holder">

      <div class="buttons-holder-2">
      <label>Stamp Size: </label>
        <input type="range" v-model="stampSize" min="50" max="400" step="10" />
        <div class="stamp-selector">
          <label>Select Stamp: </label>
          <select class="styled-select" v-model="selectedStampIndex">
            <option v-for="(stamp, index) in canvasData" :key="index" :value="index">
              Stamp {{ index + 1 }}
            </option>
          </select>
        </div>
        </div>
        <div class="buttons-holder-2">
        <button 
          :class="{'main-canvas-button': true, 'highlighted': isEraserActive}" 
          @click="setEraser"
        >Stamp Remover</button>
        <button 
          :class="{'main-canvas-button': true, 'highlighted': !isEraserActive}" 
          @click="captureStamp"
        >Stamp</button>
        </div>
        </div>
        <div ref="mainCanvas" class="main-canvas"></div>
      </div>
    
      <div class="canvas-holder-2">

      <div class="buttons-holder">

      <button class="add-canvas-button" @click="addCanvas">Add New Stamp</button>
      
      <color-picker v-model="settings.color0" />
      <color-picker v-model="settings.color1" />
      <label>Brush Size: </label>
      <input type="range" v-model="settings.brushSize" max="10" step=".5" />
      <button 
        :class="{'small-canvas-button': true, 'highlighted': activeBrush.label === brush.label}" 
        v-for="brush in displayBrushes" 
        @click="setTool(brush)" 
        v-html="brush.label">
      </button>
    
      </div>

      <div class="stamp-canvases">
      <div v-for="(canvas, index) in canvases" :key="index">
                <div class="stamp-label">Stamp {{ index + 1 }}↓</div>
                <div :ref="'canvas' + index"></div>
      
      </div>
      </div>
      </div>
      </div>
      <button class="add-canvas-button" @click="saveMainCanvas">Download your art here</button>
      
    
  </div>
    `,

    data() {
      return {
        canvases: [],
        p5Instances: [],
        canvasData: [], // Ensure there is an initial stamp
        selectedStampIndex: 0, // Initialize to 0 to start with Stamp 1 selected
        stamps: [], // Array to store each stamp's data and position
        stampSize: 200,
        isEraserActive: false,
        mainP: null,
        brushes,
        activeBrush: brushes.filter((b) => !b.hide)[0],
        settings: {
          brushSize: STARTING_BRUSH_SIZE,
          color0: STARTING_COLOR0.slice(),
          color1: STARTING_COLOR1.slice(),
        },
      };
    },
    methods: {
      addCanvas() {
        this.canvases.push({});
        this.canvasData.push({}); // Add a placeholder for the new canvas data
        this.$nextTick(() => {
          const index = this.canvases.length - 1;
          const ref = this.$refs[`canvas${index}`][0];

          sketcher(ref, (p) => {
            this.p5Instances[index] = p;
            p.mouseDragged = () => this.drawWithActiveBrush(p);
            p.mousePressed = () => this.drawWithActiveBrush(p);
            p.mouseReleased = () => {
              this.drawWithActiveBrush(p);
              this.updateStamp(index);
            };
          });
        });
      },
      captureStamp() {
        this.isEraserActive = false;
        this.p5Instances.forEach((p, index) => {
          if (p) {
            this.canvasData[index] = p.get();
            console.log(`Captured canvas ${index}:`, this.canvasData[index]);
          }
        });
      },
      updateStamp(index) {
        if (this.p5Instances[index]) {
          this.canvasData[index] = this.p5Instances[index].get();
          this.updateMainCanvasStamps();
        }
      },
      applyStamp(x, y) {
        if (this.selectedStampIndex === null) return;

        const stampData = this.canvasData[this.selectedStampIndex];
        if (!stampData) return;

        const newStamp = {
          img: stampData,
          x: x,
          y: y,
          size: this.stampSize,
          stampIndex: this.selectedStampIndex,
        };

        this.stamps.push(newStamp);
        this.redrawStamps();
      },
      setEraser() {
        this.isEraserActive = true;
      },
      setTool(brush) {
        console.log("Set brush", brush);
        this.activeBrush = brush;
        this.activeBrush.setup?.(this.mainP, this.settings);
        this.isEraserActive = false;
      },
      handleMainCanvasClick(p) {
        p.mousePressed = () => {
          if (this.isEraserActive) {
            this.eraseStamp(p.mouseX, p.mouseY);
          } else {
            this.applyStamp(p.mouseX, p.mouseY);
          }
        };
      },
      addStamp(x, y) {
        if (!this.canvasData[this.selectedStampIndex]) return;

        const stamp = {
          x: x,
          y: y,
          size: this.stampSize,
        };
        this.stamps.push(stamp);
        this.redrawStamps();
      },
      eraseStamp(x, y) {
        for (let i = this.stamps.length - 1; i >= 0; i--) {
          const stamp = this.stamps[i];
          if (
            x > stamp.x - stamp.size / 2 &&
            x < stamp.x + stamp.size / 2 &&
            y > stamp.y - stamp.size / 2 &&
            y < stamp.y + stamp.size / 2
          ) {
            this.stamps.splice(i, 1);
            this.redrawStamps();
            break;
          }
        }
      },
        /*
        console.log('Loop starting with stamps length:', this.stamps.length);
        for (let i = this.stamps.length - 1; i >= 0; i--) {
          const stamp = this.stamps[i];
          if (
            x > stamp.x - stamp.size / 2 &&
            x < stamp.x + stamp.size / 2 &&
            y > stamp.y - stamp.size / 2 &&
            y < stamp.y + stamp.size / 2
          ) {
          //const relativeX = Math.floor(x - (stamp.x - stamp.size / 2));
          //const relativeY = Math.floor(stamp.y - stamp.size / 2);

          //find a way to change x y into stamp
          tempCanvas = stamp.img;
          pixelcolor = tempCanvas.get(stamp.x, stamp.y);
          //console.log(stamp.x, stamp.y);
          //console.log(x, y);
          //console.log(relativeX, relativeY);
          //console.log(pixelcolor);
          if (pixelcolor[3] === 255){
            is_opaque = true;
            this.stamps.splice(i, 1);
            this.redrawStamps();
            break;
          }
          }
        }
      },
      */
      
      updateMainCanvasStamps() {
        this.stamps.forEach((stamp) => {
          stamp.img = this.canvasData[stamp.stampIndex];
        });
        this.redrawStamps();
      },
      redrawStamps() {
        if (!this.mainP) return;

        this.mainP.clear();
        this.mainP.background(255, 255, 255);

        this.stamps.forEach((stamp) => {
          this.mainP.image(
            stamp.img,
            stamp.x - stamp.size / 2,
            stamp.y - stamp.size / 2,
            stamp.size,
            stamp.size
          );
        });
      },
      drawWithActiveBrush(p) {
        if (this.isEraserActive) {
          // Erase logic here if needed
        } else {
          this.activeBrush.mouseDragged?.(p, this.settings);
        }
      },
      saveMainCanvas() {
        const canvas = this.mainP.canvas;
        const link = document.createElement("a");
        link.download = "canvas.png";
        link.href = canvas.toDataURL();
        link.click();
      },
    },
    mounted() {
      new p5((p) => {
        this.mainP = p;
        p.frameRate(30);

        p.setup = () => {
          this.mainCanvas = p.createCanvas(main_canvas_side, main_canvas_side);
          p.background(255, 255, 255); //make this changable later
          p.ellipseMode(p.RADIUS);
        };

        this.handleMainCanvasClick(p);

        p.draw = () => {
          this.redrawStamps();
        };
      }, this.$refs.mainCanvas);

      // Add initial drawing canvas
      this.addCanvas();
    },
    computed: {
      displayBrushes() {
        return this.brushes.filter((b) => !b.hide);
      },
    },
  });
});
