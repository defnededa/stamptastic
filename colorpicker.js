Vue.component("color-picker", {
  template: `<input type="color" v-model="hexColor" @change="change" />`,
  methods: {
    change() {
      let rgb = hexToRGB(this.hexColor);
      this.$emit("input", rgb);
    },
  },
  data() {
    let hexColor = RGBToHex(...this.value);

    return {
      hexColor,
    };
  },
  props: ["value"],
});

// Function to convert hex to RGB
function hexToRGB(H) {
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }

  r = +r;
  g = +g;
  b = +b;

  return [r, g, b];
}

// Function to convert RGB to hex
function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
}
