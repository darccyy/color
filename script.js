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

  c: {
    name: "Cyan",
    max: 100,
  },
  m: {
    name: "Magenta",
    max: 100,
  },
  y: {
    name: "Yellow",
    max: 100,
  },
};
var lastHsv;

// Initialize
function init() {
  var html = "";
  for (var id in sliders) {
    html += F.format($("template[name=slider]").html(), {
      ...sliders[id],
      id,
    });
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
  if ("hsv".includes(id)) {
    var rgb = F.hsv2rgb(current);

    $("#r").val(rgb.r);
    $("#g").val(rgb.g);
    $("#b").val(rgb.b);

    var cmy = hsv2cmy(current);
    $("#c").val(cmy.c);
    $("#y").val(cmy.y);
    $("#m").val(cmy.m);
    $("#k").val(cmy.k);
  } else if ("rgb".includes(id)) {
    var hsv = F.rgb2hsv(current);
    // Preserve HSV when RGB = 0 or 255
    if (hsv.s && hsv.v) {
      lastHsv = hsv;
    } else if (lastHsv) {
      hsv.h = lastHsv.h;
      if (current.r + current.g + current.b === 0) {
        hsv.s = lastHsv.s;
      }
    }

    $("#h").val(hsv.h);
    $("#s").val(hsv.s);
    $("#v").val(hsv.v);

    var cmy = rgb2cmy(current);
    $("#c").val(cmy.c);
    $("#y").val(cmy.y);
    $("#m").val(cmy.m);
    $("#k").val(cmy.k);
  } else if ("cmyk".includes(id)) {
    var rgb = cmy2rgb(current);

    $("#r").val(rgb.r);
    $("#g").val(rgb.g);
    $("#b").val(rgb.b);

    var hsv = F.rgb2hsv(rgb);
    // Preserve HSV when RGB = 0 or 255
    if (hsv.s && hsv.v) {
      lastHsv = hsv;
    } else if (lastHsv) {
      hsv.h = lastHsv.h;
      if (rgb.r + rgb.g + rgb.b === 0) {
        hsv.s = lastHsv.s;
      }
    }

    $("#h").val(hsv.h);
    $("#s").val(hsv.s);
    $("#v").val(hsv.v);
  } else {
    console.error("Invalid ID");
  }

  // Reset current values
  for (var i in sliders) {
    current[i] = parseInt($("#" + i).val());
    $("#value_" + i).text(current[i]);
  }

  // Set hex value as text
  var hex = F.rgb2hex(current, true);
  $("#hex")
    .val(hex)
    .css("color", current.v > 50 && current.s < 50 ? "black" : "white");

  // Set color of display and tones
  var tones = {
    color: [0, 0],
    darker: [15, -25],
    dark: [10, -15],
    light: [-15, 10],
    lighter: [-25, 20],
  };
  var multiply = 0.5;
  var hsv = F.rgb2hsv(current);
  for (var i in tones) {
    var value = F.hsv2hex(
      {
        ...hsv,
        s: F.border(hsv.s + tones[i][0] * multiply, 0, 100),
        v: F.border(hsv.v + tones[i][1] * multiply, 0, 100),
      },
      true,
    );
    $("#" + i).css("background-color", value);
    $("#" + i).attr("title", value);
    $("#" + i).attr("value", value);
  }

  // Set slider gradients
  var resolution = 20;
  var backgrounds = {
    header: new Array(resolution + 1).fill(false).map((item, index) => {
      return F.hsv2hex({
        h: (index * (360 / resolution) + current.h) % 360,
        s: F.border(current.s * (current.v / 100 + 0.3), 30, 70),
        v: F.border(current.v, 40, 100),
      });
    }),

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

    c: [cmy2hex({ ...current, c: 0 }), cmy2hex({ ...current, c: 100 })],
    m: [cmy2hex({ ...current, m: 0 }), cmy2hex({ ...current, m: 100 })],
    y: [cmy2hex({ ...current, y: 0 }), cmy2hex({ ...current, y: 100 })],
  };
  for (var i in backgrounds) {
    $("#" + i).css(
      "background",
      `linear-gradient(to right, ${backgrounds[i].join(", ")})`,
    );
  }
}

// Set sliders to random color
function random() {
  var rgb = F.hex2rgb(F.randomHex());
  $("#r").val(rgb.r);
  $("#g").val(rgb.g);
  $("#b").val(rgb.b);
  change("r");
}

// Many random colors in a row
async function roll() {
  if (!localStorage.shownWarning) {
    if (!confirm("Flash warning!\nPress OK to continue")) {
      return;
    }

    localStorage.shownWarning = true;
  }

  random();
  for (var i = 0; i <= 5; i++) {
    await F.sleep(80);
    random();
  }
}

// Copy hex value to clipboard
function copyValue(element) {
  // Don't activate if input box focused
  if ($("#hex").is(":focus-within")) {
    return;
  }
  F.copy($(element).attr("value"));
}

// User change hex value with input box
function changeHex() {
  var hex = $("#hex").val();
  // Validate hex - optional #, only length 6
  if (!/^#/.test(hex)) {
    hex = "#" + hex;
  }
  if (!/^#[A-Fa-f0-9]{6}$/.test(hex)) {
    return;
  }

  var rgb = F.hex2rgb(hex);
  $("#r").val(rgb.r);
  $("#g").val(rgb.g);
  $("#b").val(rgb.b);
  change("r");
}

// Convert CMY to RGB
function cmy2rgb(cmy) {
  return {
    r: (100 - cmy.c) * 2.55,
    g: (100 - cmy.m) * 2.55,
    b: (100 - cmy.y) * 2.55,
  };
}

// Convert RGB to CMY
function rgb2cmy(rgb) {
  return {
    c: (255 - rgb.r) / 2.55,
    m: (255 - rgb.g) / 2.55,
    y: (255 - rgb.b) / 2.55,
  };
}

// Convert CMY to hex
function cmy2hex(cmy) {
  return F.rgb2hex(cmy2rgb(cmy));
}

// Convert CMY to HSV
function cmy2hsv(cmy) {
  return F.rgb2hsv(cmy2rgb(cmy));
}

// Convert HSV to CMY
function hsv2cmy(hsv) {
  return rgb2cmy(F.hsv2rgb(hsv));
}
