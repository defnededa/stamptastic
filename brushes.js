const WIDTH = window.innerWidth / 2 - window.innerWidth / 10;
const HEIGHT = window.innerWidth / 2 - window.innerWidth / 10;
const DEFAULT_FRAME_RATE = 30;
const DEFAULT_LOOP_LENGTH_IN_FRAMES = 100;

const STARTING_COLOR0 = [255, 0, 0];
const STARTING_COLOR1 = [255, 234, 0];
const STARTING_BRUSH_SIZE = 5;
const BG_COLOR = [255, 255, 255];

function startDrawing(p) {
  //bg color
  p.background(0, 100, 0);
}
function drawHeart(p, x, y, size) {
  p.beginShape();
  p.vertex(x, y);
  p.bezierVertex(
    x - size / 2,
    y - size / 2,
    x - size,
    y + size / 3,
    x,
    y + size
  );
  p.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  p.endShape();
}

let brushes = [
  //hearts
  {
    label: "hearts",
    hide: true,
    description: "A brush that draws hearts discretely",
    //uses beginshape and endshapoe through drawheart, also bezier curve through drawheart
    setup(p, { color0, color1, brushSize }) {
      console.log("SETUP BRUSH");
      this.totalDist = 0;

      this.index = 0;
    },
    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      // Define velocity
      let vx = x - this.x0;
      let vy = y - this.y0;
      // Distance since last drag
      let d = Math.sqrt(vx ** 2 + vy ** 2);
      console.log(d);
      p.fill(333, 100, 39);
      drawHeart(p, x, y, 20);
    },
  },
  {
    label: "pencil",
    hide: true,
    description: "A brush that draws a continuous rainbow line",

    setup(p, { color0, color1, brushSize }) {
      this.points = [];
    },

    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      let point = {
        x: x,
        y: y,
        color: p.lerpColor(p.color(color0), p.color(color1), Math.random()),
      };
      this.points.push(point);

      p.noFill();
      p.beginShape();

      for (let i = 0; i < this.points.length; i++) {
        p.stroke(this.points[i].color);
        p.curveVertex(this.points[i].x, this.points[i].y);
      }

      p.endShape();
    },
  },
  {
    label: "Paint",
    hide: false,
    description: "A brush that draws individual circles",

    setup(p, { color0, color1, brushSize }) {
      // No setup required for this brush
    },

    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      // Draw a circle at the mouse position
      p.fill(p.lerpColor(p.color(color0), p.color(color1), Math.random()));
      p.noStroke();
      p.ellipse(x, y, brushSize * 10, brushSize * 10);
    },
  },
  {
    label: "line",
    hide: true,
    description:
      "A brush that draws a continuous line while dragging but starts a new line on mouse press",

    setup(p, { color0, color1, brushSize }) {
      this.paths = [];
    },

    mousePressed(p, { color0, color1, brushSize }) {
      this.currentPath = [];
      this.paths.push({ points: this.currentPath, color: p.color(color0) });
    },

    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      let point = {
        x: x,
        y: y,
      };
      this.currentPath.push(point);

      p.noFill();
      p.strokeWeight(brushSize);

      // Draw all paths
      for (let path of this.paths) {
        p.stroke(path.color);

        p.beginShape();
        for (let i = 0; i < path.points.length; i++) {
          p.vertex(path.points[i].x, path.points[i].y);
        }
        p.endShape();
      }
    },
  },
  {
    label: "Eraser",
    hide: false,
    description:
      "An eraser brush that uses erase() to remove parts of the canvas",

    setup(p, { brushSize }) {
      // No setup required for this brush
    },

    mouseDragged(p, { brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      // Enable erasing
      p.erase(255, 255);
      p.noStroke();
      p.fill(255); // Fill color doesn't matter in erase mode
      p.ellipse(x, y, brushSize * 10, brushSize * 10);
      p.noErase(); // Disable erasing
    },
  },
  {
    label: "line2",
    hide: true,
    description:
      "A brush that draws a continuous line while dragging but starts a new line on mouse press",

    setup(p, { color0, color1, brushSize }) {
      this.paths = [];
    },

    mousePressed(p, { color0, color1, brushSize }) {
      this.currentPath = [];
      this.paths.push({
        points: this.currentPath,
        color: p.color(color0),
        size: brushSize,
      });
      p.stroke(p.color(color0));
      p.strokeWeight(brushSize);
    },

    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      let point = {
        x: x,
        y: y,
      };
      this.currentPath.push(point);

      p.noFill();

      // Draw all paths
      for (let path of this.paths) {
        p.stroke(path.color);
        p.strokeWeight(path.size);

        p.beginShape();
        for (let i = 0; i < path.points.length; i++) {
          p.vertex(path.points[i].x, path.points[i].y);
        }
        p.endShape();
      }
    },
  },
  {
    label: "line3",
    hide: true,
    description:
      "A brush that draws a continuous line while dragging but starts a new line on mouse press",

    setup(p, { color0, color1, brushSize }) {
      this.paths = [];
    },

    mousePressed(p, { color0, color1, brushSize }) {
      this.currentPath = [];
      this.paths.push({
        points: this.currentPath,
        color: p.color(color0),
        size: brushSize,
      });

      // Ensure the color and brush size are set correctly at the start of drawing
      p.stroke(p.color(color0));
      p.strokeWeight(brushSize);
    },

    mouseDragged(p, { color0, color1, brushSize }) {
      let x = p.mouseX;
      let y = p.mouseY;

      let point = {
        x: x,
        y: y,
      };
      this.currentPath.push(point);

      p.noFill();

      // Draw the current path in progress
      p.stroke(p.color(color0));
      p.strokeWeight(brushSize * 5);
      p.beginShape();
      for (let i = 0; i < this.currentPath.length; i++) {
        p.vertex(this.currentPath[i].x, this.currentPath[i].y);
      }
      p.endShape();

      // Draw all previous paths
      for (let path of this.paths) {
        p.stroke(path.color);
        p.strokeWeight(path.size);
        p.beginShape();
        for (let i = 0; i < path.points.length; i++) {
          p.vertex(path.points[i].x, path.points[i].y);
        }
        p.endShape();
      }
    },
  },
];
