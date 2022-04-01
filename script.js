const sliders = {
  h: {
    name: "Hue",
    max: 360,
  },
  s: {
    name: "Saturation",
    max: 100,
  },
  v: {
    name: "Value",
    max: 100,
  },

  r: {
    name: "Red",
    max: 255,
  },
  g: {
    name: "Green",
    max: 255,
  },
  b: {
    name: "Blue",
    max: 255,
  },
};
var hex;

// Initialize
function init() {
  var html = "";
  for (var i in sliders) {
    var item = sliders[i];
    html += `
      <article>
        <input id="${i}" type="range" min="0" max="${item.max}" value="0" oninput="change('${i}')" title="${item.name}" />
        <label>
          ${item.name}
          <span id="value_${i}">0</span>
        </label>
      </article>
    `;
  }
  $("#sliders").html(html);

  random();
}

// Oninput for sliders, after random()
function change(id) {
  // Set current values
  var current = {};
  for (var i in sliders) {
    current[i] = parseInt($("#" + i).val());
  }

  // Standardize colors
  var color;
  if ("rgb".includes(id)) {
    var hsv = F.rgb2hsv(current);
    color = [current.r, current.g, current.b].join(", ");

    $("#h").val(hsv.h);
    $("#s").val(hsv.s);
    $("#v").val(hsv.v);
  } else {
    var rgb = F.hsv2rgb(current);
    color = [rgb.r, rgb.g, rgb.b].join(", ");

    $("#r").val(rgb.r);
    $("#g").val(rgb.g);
    $("#b").val(rgb.b);
  }
  $("#display").css("background-color", "rgb(" + color + ")");

  // Reset current values
  for (var i in sliders) {
    current[i] = parseInt($("#" + i).val());
    $("#value_" + i).text(current[i]);
  }

  // Set slider gradients
  var resolution = 20;
  var backgrounds = {
    h: new Array(resolution + 1).fill(false).map((item, index) => {
      return F.hsv2hex({
        h: index * (360 / resolution),
        s: current.s,
        v: current.v,
      });
    }),
    s: [F.hsv2hex({ ...current, s: 0 }), F.hsv2hex({ ...current, s: 100 })],
    v: [F.hsv2hex({ ...current, v: 0 }), F.hsv2hex({ ...current, v: 100 })],

    r: [F.rgb2hex({ ...current, r: 0 }), F.rgb2hex({ ...current, r: 255 })],
    g: [F.rgb2hex({ ...current, g: 0 }), F.rgb2hex({ ...current, g: 255 })],
    b: [F.rgb2hex({ ...current, b: 0 }), F.rgb2hex({ ...current, b: 255 })],
  };
  for (var i in backgrounds) {
    $("#" + i).css(
      "background",
      `linear-gradient(to right, ${backgrounds[i].join(", ")})`,
    );
  }

  // Set hex value
  hex = F.rgb2hex(current).slice(0, -2);
  $("#hex")
    .text(hex)
    .css("color", current.v > 50 && current.s < 50 ? "black" : "white");
}

// Set sliders to random color
function random() {
  var rgb = F.hex2rgb(F.randomHex());
  $("#r").val(rgb.r);
  $("#g").val(rgb.g);
  $("#b").val(rgb.b);
  change("r");
}

// Copy hex value to clipboard
function copy() {
  F.copy(hex);
}
