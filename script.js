var sliders = {
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

function init() {
  var html = "";
  var rgb = F.hex2rgb(F.randomHex());
  console.log(rgb);
  for (var i in sliders) {
    var item = sliders[i];
    html += `
      <article>
        <input id="${i}" type="range" min="0" max="${item.max}" value="${
      rgb[i] || 0
    }" oninput="change('${i}')" title="${item.name}" />
        <label>
          ${item.name}
          <span id="value_${i}">0</span>
        </label>
      </article>
    `;
  }
  $("#sliders").html(html);
  change("r");
}

function change(id) {
  var current = {};
  for (var i in sliders) {
    current[i] = parseInt($("#" + i).val());
  }

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

  for (var i in sliders) {
    current[i] = parseInt($("#" + i).val());
    $("#value_" + i).text(current[i]);
  }

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
}

F.rgb2hsv = function (rgb) {
  var { r, g, b } = rgb;

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    h,
    s = max === 0 ? 0 : d / max,
    v = max / 255;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = g - b + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = b - r + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = r - g + d * 4;
      h /= 6 * d;
      break;
  }

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100,
  };
};
