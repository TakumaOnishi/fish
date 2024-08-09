// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener("DOMContentLoaded", () => { // 読み込みを待って処理を始める

  const developing = false;

  const _body = document.body;
  const _upper = document.getElementById("upper");
  const _lower = document.getElementById("lower");
  const _help = document.getElementById("help");
  const _conf = document.getElementById("conf");
  const _preset = document.getElementById("preset");
  const _filter = document.getElementById("filter");
  const _select_os = document.getElementById("select_os"); // HTML要素を取得する
  const _os = document.getElementsByClassName("os");
  const _tag = document.getElementsByClassName("tag");
  const _code = document.getElementsByClassName("code");
  const _make_custom = document.getElementById("make_custom");
  const _help_toggle = document.getElementById("help_toggle");
  const _conf_toggle = document.getElementById("conf_toggle");
  const _key = document.getElementsByClassName("key");
  const _combos = document.getElementById("combos");
  const _layer = document.getElementsByClassName("layer");
  const _combo = document.getElementsByClassName("combo");
  const _remove_layer = document.getElementById("remove_layer");
  const _remove_combo = document.getElementById("remove_combo");
  const _left = document.getElementById("left");
  const _right = document.getElementById("right");
  const _left_layer = document.getElementsByClassName("left_layer");
  const _right_layer = document.getElementsByClassName("right_layer");
  const _left_combo = document.getElementsByClassName("left_combo");
  const _right_combo = document.getElementsByClassName("right_combo");
  const _header = document.getElementsByClassName("header");
  const _preset_toggle = document.getElementById("preset_toggle");
  const _l_preset = document.getElementById("l_preset");
  const _l_keymap = document.getElementById("l_keymap");
  const _l_keymap_input = document.querySelector("#l_keymap input");
  const _s_keymap = document.getElementById("s_keymap");
  const _s_firmware = document.getElementById("s_firmware");
  const _combo_hints = document.getElementById("combo_hints");
  const _combo_hint = _combo_hints.children;
  const _custom_input = document.getElementById("custom_input");
  const _grab_custom = document.getElementById("grab_custom");
  const _exceptions = document.getElementById("exceptions");

  let timeoutID = 0;
  let controller = null;
  let editingLayer = true;
  let _grabbing = null
  let _swap = null;
  let _swap_key = null;
  let _last_shown = _layer[0];
  let lastName = "";

  initialize();


  function initialize() {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("windows nt")) {
      _select_os.value = "w";
    } else if (ua.includes("android")) {
      _select_os.value = "a";
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
      _select_os.value = "i";
    } else if (ua.includes("mac os x")) {
      _select_os.value = "m";
    } else {
      _select_os.value = "l";
    }
    window.addEventListener('beforeunload', (e) => {
      if(developing) return;
      const message = 'Are you sure to discard changes and close this tab?';
      e.preventDefault();
      e.returnValue = message;
      return message;
    });
    _body.addEventListener("click", bodyClick);
    _body.addEventListener("mousemove", bodyMove);
    _select_os.addEventListener("change", updateOS);
    for (let i = 0; i < _code.length; i++) {
      _code[i].addEventListener("click", codeClick);
    }
    _make_custom.addEventListener("click", makeCustom);
    _grab_custom.addEventListener("click", grabCustom);
    for (let i = 0; i < _key.length; i++) {
      _key[i].addEventListener("click", keyClick);
      _key[i].addEventListener("mouseenter", keyEnter);
      _key[i].addEventListener("mouseleave", keyLeave);
    }
    _layer[0].addEventListener("click", layerClick);
    _layer[0].lastChild.addEventListener("focus", nameFocus);
    _layer[0].lastChild.addEventListener("blur", nameBlur);
    _remove_layer.addEventListener("click", removeLayer);
    document.getElementById("add_layer").addEventListener("click", addLayer);
    _remove_combo.addEventListener("click", removeCombo);
    document.getElementById("add_combo").addEventListener("click", addCombo);
    _help_toggle.addEventListener("click", helpToggle);
    _conf_toggle.addEventListener("click", confToggle);
    _l_keymap.addEventListener("click", () => {
      _l_keymap_input.value = "";
      _l_keymap_input.click();
    });
    _l_keymap_input.addEventListener("change", loadInputChange);
    _preset_toggle.addEventListener("click", togglePreset);
    _l_preset.addEventListener("click", loadPreset);
    _s_keymap.addEventListener("click", saveClick);
    _s_firmware.addEventListener("click", buildClick);
    document.getElementById("show_advanced_toggle").addEventListener("change", () => { _conf.classList.toggle("show_advanced") });
    updateOS();
    if (document.getElementById("show_advanced_toggle").checked) _conf.classList.add("show_advanced");
    fetch("https://raw.githubusercontent.com/TakumaOnishi/zmk-config-fish/master/config/boards/shields/fish/fish.keymap").then(r => { return r.text() }).then(t => {
      loadInputChange(t); // デフォルトキーマップをロードする
    });
  }

  function updateOS() {
    let s = _select_os.value;
    if (s != "") {
      for (let i = 0; i < _code.length; i++) {
        if (_code[i].classList.contains("custom")) continue;
        if (_code[i].querySelector(".hint").classList.contains(s)) {
          _code[i].style.display = "flex";
        } else {
          _code[i].style.display = "none";
        }
      }
      for (let i = 0; i < _os.length; i++) { // OSごとにキーの表示や説明を替える
        if (_os[i].classList.contains(s)) {
          _os[i].style.display = "inline";
        } else {
          _os[i].style.display = "none";
        }
      }
    } else { // compatible with "any" のとき
      for (let i = 0; i < _code.length; i++) {
        _code[i].style.display = "flex";
      }
      for (let i = 0; i < _os.length; i++) {
        if (_os[i].classList.contains("l")) { // anyの時の表示はlinuxに合わせる
          _os[i].style.display = "inline";
        } else {
          _os[i].style.display = "none";
        }
      }
    }
  }

  function bodyMove(e) {
    if (_grabbing) {
      _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
    }
  }

  function keyEnter(e) {
    if (_grabbing) return;
    if (editingLayer) {
      document.querySelector(".editing .l" + e.target.id.slice(1) + " .hint").classList.add("hover");
    } else if (!e.target.classList.contains("weak")) {
      document.querySelector(".hint.editing").classList.add("hover");
    }
  }

  function keyLeave(e) {
    if (editingLayer) {
      document.querySelector(".editing .l" + e.target.id.slice(1) + " .hint").classList.remove("hover");
    } else if (!e.target.classList.contains("weak")) {
      document.querySelector(".hint.editing").classList.remove("hover");
    }
  }

  function bodyClick(e) { // つかみ中に関係ないとこクリックしたらキャンセル
    if (!_custom_input.classList.contains("disabled") && !e.target.closest("#make_custom, #custom_input")) {
      _custom_input.classList.add("disabled");
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _help_toggle.classList.remove("weak");
      _conf_toggle.classList.remove("weak");
      return;
    }
    if (!_help.classList.contains("disabled") && !e.target.closest(".modal, #help_toggle")) {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _conf_toggle.classList.remove("weak");
      _help.classList.add("disabled");
      _help_toggle.innerHTML = '<span class="material-symbols-rounded">info</span>';
      return;
    }
    if (!_conf.classList.contains("disabled") && !e.target.closest(".modal, #conf_toggle")) {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _help_toggle.classList.remove("weak");
      _conf.classList.add("disabled");
      _conf_toggle.innerHTML = '<span class="material-symbols-rounded">tune</span>';
      return;
    }
    if (!_preset.classList.contains("disabled") && !e.target.closest(".modal, #preset_toggle")) {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _help_toggle.classList.remove("weak");
      _conf_toggle.classList.remove("weak");
      _preset.classList.add("disabled");
      return;
    }
    if (!_grabbing) return;
    if (e.target.closest(".code, .key, #map, #grab_custom")) return;
    grabbingEnd();
  }

  function codeClick(e) {
    if (_grabbing) {
      if (_grabbing.querySelector("span.mono").innerHTML.substring(5, 7) == "kp" && !_grabbing.querySelector("p.mod") && e.target.querySelector("p.mod, p.lay")) {
        const holdP = e.target.querySelector("p").innerHTML.replace("<br>", "");
        const holdCode = e.target.querySelector("span.mono").innerHTML.substring(8);
        makeHoldTap(holdP, holdCode, _grabbing, _grabbing); // kp(mod以外) > hold => mt, lt
      } else if (_grabbing.querySelector("p.mod") && e.target.querySelector("span.mono").innerHTML.substring(5, 7) == "kp") {
        makeModified(_grabbing, e.target, _grabbing); // (mod > ) mod > kp => modded 
      }
    } else {
      _grabbing = document.createElement("div");
      _grabbing.classList.add("grabbing");
      _grabbing.innerHTML = e.target.innerHTML;
      const box = e.target.getBoundingClientRect();
      _grabbing.style.top = (box.y - e.clientY) + "px";
      _grabbing.style.left = (box.x - e.clientX) + "px";
      _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
      _body.append(_grabbing);
      if (_grabbing.querySelector("span.mono").innerHTML.substring(5, 7) == "kp") {
        if (_grabbing.querySelector("p.mod")) {
          grabbingStart("kp"); // can make modified
        } else {
          grabbingStart("hold"); // can make hold-tap
        }
      } else {
        grabbingStart();
      }
    }
  }

  function makeCustom() {
    _upper.classList.add("weak");
    _lower.classList.add("weak");
    _help_toggle.classList.add("weak");
    _conf_toggle.classList.add("weak");
    _custom_input.classList.remove("disabled");
    _custom_input.firstElementChild.focus();
  }

  function grabCustom(e) {
    const code = _custom_input.firstElementChild.value;
    if (code == "") {
      alert("keycode is requied!");
      return;
    }
    _grabbing = document.createElement("div");
    _grabbing.classList.add("grabbing");
    _grabbing.innerHTML = '<p>' + code.replace("&", "").toLowerCase() + '</p><div class="hint"><p><span class="mono">' + code + '</span>custom keycode</p></div>';
    const box = e.target.getBoundingClientRect();
    _grabbing.style.top = (box.y - e.clientY) + "px";
    _grabbing.style.left = (box.x - e.clientX) + "px";
    _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
    _body.append(_grabbing);
    grabbingStart();
    _custom_input.classList.add("disabled");
    _upper.classList.remove("weak");
    _lower.classList.remove("weak");
    _help_toggle.classList.remove("weak");
    _conf_toggle.classList.remove("weak");
  }

  function keyClick(e) {
    const _legend = document.querySelector(".editing .l" + e.target.id.slice(1));
    if (editingLayer) { // layer編集時
      if (_grabbing) {
        if (_swap) {
          if (_legend.querySelector("p.trans")) {
            _swap_key.classList.add("weak");
          } else {
            _swap_key.classList.remove("weak");
          }
          _swap.innerHTML = _legend.innerHTML;
          _swap.classList.remove("weak");
        }
        if (_grabbing.querySelector("p.trans")) {
          e.target.classList.add("weak");
        } else {
          e.target.classList.remove("weak");
        }
        _legend.innerHTML = _grabbing.innerHTML;
        _legend.querySelector(".hint").classList.add("hover");
        grabbingEnd();
      } else {
        _swap = _legend;
        _swap_key = e.target;
        _grabbing = document.createElement("div");
        _grabbing.classList.add("grabbing", "swap");
        _grabbing.innerHTML = _legend.innerHTML;
        const box = _legend.getBoundingClientRect();
        _grabbing.style.top = (box.y - e.clientY) + "px";
        _grabbing.style.left = (box.x - e.clientX) + "px";
        _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        _body.append(_grabbing);
        _legend.querySelector(".hint").classList.remove("hover");
        _legend.classList.add("weak");
        grabbingStart();
      }
    } else if (_grabbing) { // combo編集時
      e.target.classList.remove("weak");
      let name = _grabbing.querySelector("span.mono").innerHTML.substring(5).replace(/\s|\(/g, "_").replaceAll(/kp_|bt_|out_|mkp_|\)/g, "").toLowerCase();
      name = findNewName(_combo, name, 1);
      document.querySelector(".combo.editing input").value = name;
      _legend.classList.add("combo_pos");
      const _hint = document.querySelector(".hint.editing");
      _grabbing.querySelector(".hint").classList.add("editing", "hover");
      _hint.outerHTML = _grabbing.querySelector(".hint").outerHTML;
      _grabbing.querySelector(".hint").remove();
      const _combo_pos = document.querySelectorAll(".editing .combo_pos");
      for (let i = 0; i < _combo_pos.length; i++) {
        _combo_pos[i].innerHTML = _grabbing.innerHTML;
      }
      grabbingEnd();
      moveComboHint();
      const i = [].slice.call(_combo).indexOf(document.querySelector(".combo.editing"));
      _exceptions.querySelectorAll(".advanced p")[i].innerHTML = "except “" + name + "”";
    } else {
      if (e.target.classList.contains("weak")) {
        _legend.innerHTML = document.querySelector(".editing .combo_pos").innerHTML;
        document.querySelector(".hint.editing").classList.add("hover");
      } else {
        if (document.querySelectorAll(".editing .combo_pos").length <= 2) return;
        _legend.innerHTML = "";
        document.querySelector(".hint.editing").classList.remove("hover");
      }
      e.target.classList.toggle("weak");
      _legend.classList.toggle("combo_pos");
      moveComboHint();
    }
  }

  function findNewName(elements, name, count) {
    let newName = count == 1 ? name : name + "_" + count;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains("editing")) continue;
      if (elements[i].lastChild.value == newName) {
        return findNewName(elements, name, count + 1);
      }
    }
    return newName;
  }

  function makeHoldTap(holdP, holdCode, _tap, _to) {
    const tap = _tap.querySelector("p").innerHTML.replace("<br>", "");
    _to.querySelector("p").remove();
    const _new_p = document.createElement("p");
    _new_p.innerHTML = tap + "<br><span class='small'>(" + holdP + ")</span>";
    _to.prepend(_new_p);
    const type = isNaN(holdCode) ? "&amp;mt " : "&amp;lt ";
    const code = holdCode + " " + _tap.querySelector("span.mono").innerHTML.substring(8);
    const desc = tap + " when tapped, " + holdP + " when held";
    _to.querySelector(".hint p").innerHTML = "<span class='mono'>" + type + code + "</span>" + desc;
    if (_grabbing) grabbingStart();
  }

  function makeModified(_mod, _inner, _to) {
    let mod;
    const inner = _inner.querySelector("p").innerHTML;
    const open = _mod.querySelector("p").dataset.open;
    const close = _mod.querySelector("p").dataset.close;
    const mark = _mod.querySelector("p").dataset.mark;
    const p = _mod.querySelector("p");
    if (p.dataset.close.length <= 1) {
      mod = _mod.querySelector("p").innerHTML;
    } else {
      const hintP = _mod.querySelector(".hint p").innerHTML;
      mod = hintP.substring(hintP.indexOf("</span>") + 7);
    }
    if (_inner.querySelector("p.mod")) {
      p.dataset.open += _inner.querySelector("p").dataset.open;
      p.dataset.close += _inner.querySelector("p").dataset.close;
      p.dataset.mark += _inner.querySelector("p").dataset.mark;
      if (_grabbing) grabbingStart("kp");
    } else {
      p.classList.remove("mod");
      if (_grabbing) grabbingStart();
    }
    p.innerHTML = mark + inner;
    const innerCode = _inner.querySelector("span.mono").innerHTML.substring(8); // 必ず"&amp;kp "なので
    const desc = mod + "+" + inner;
    _to.querySelector(".hint").outerHTML = _inner.querySelector(".hint").outerHTML;
    _to.querySelector(".hint p").innerHTML = "<span class='mono'>&amp;kp " + open + innerCode + close + "</span>" + desc.replace("<br>", "");
  }

  function layerClick(e) {
    if (e.target.closest(".layer").classList.contains("editing")) return; // closest()は自身を含む
    show(e.target.closest(".layer"));
  }

  function comboClick(e) {
    if (e.target.closest(".combo").classList.contains("editing")) return; // closest()は自身を含む
    show(e.target);
  }

  function addLayer(ignore) {
    const _editing = document.querySelector(".layer.editing");
    const i = _editing ? [].slice.call(_layer).indexOf(_editing) : _layer.length - 1;
    const _new_layer = document.createElement("div");
    const _new_left = document.createElement("div");
    const _new_right = document.createElement("div");
    _new_layer.classList.add("layer", "editing");
    _new_left.classList.add("left_layer", "editing");
    _new_right.classList.add("right_layer", "editing");
    _layer[i].after(_new_layer);
    _left_layer[i].after(_new_left);
    _right_layer[i].after(_new_right);
    show(_new_layer);
    _new_layer.innerHTML = "<div class='layer_index'>" + (i + 1) + ".</div><input type='text' value='" + findNewName(_layer, "blank", 1) + "'/>";
    _new_left.innerHTML = "<div class='col c0'><div class='legend l8'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c1'><div class='legend l9'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l20'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c2'><div class='legend l0'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l10'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l21'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c3'><div class='legend l1'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l11'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l22'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c4'><div class='legend l2'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l12'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l23'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c5'><div class='legend l3'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l13'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='row r0'><div class='legend l28'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l29'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div>";
    _new_right.innerHTML = "<div class='col c6'><div class='legend l4'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l14'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c7'><div class='legend l5'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l15'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l24'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c8'><div class='legend l6'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l16'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l25'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c9'><div class='legend l7'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l17'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l26'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col ca'><div class='legend l18'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l27'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col cb'><div class='legend l19'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='row r1'><div class='legend l30'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l31'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div>";
    _new_layer.addEventListener("click", layerClick);
    _new_layer.lastChild.addEventListener("focus", nameFocus);
    _new_layer.lastChild.addEventListener("blur", nameBlur);
    for (let si = i + 1; si < _layer.length; si++) {
      _layer[si].firstChild.innerHTML = si + ".";
    }
    updateLayerCodes(_layer.length - 1);
    if (ignore != true) {
      _new_layer.lastElementChild.select();
    }
  }

  function removeLayer(ignore) {
    if (ignore != true) {
      if (!window.confirm('Are you sure to discard this layer?')) return;
    }
    const _editing = document.querySelector(".layer.editing");
    const i = [].slice.call(_layer).indexOf(_editing);
    show(_layer[Math.abs(i - 1)]); // layer[0]を消そうとしてるときはlayer[1]に相続する
    _editing.removeEventListener("click", layerClick);
    _editing.lastChild.removeEventListener("focus", nameFocus);
    _editing.lastChild.removeEventListener("blur", nameBlur);
    _editing.remove();
    _left_layer[i].remove();
    _right_layer[i].remove();
    for (let si = i; si < _layer.length; si++) {
      if (si == 0) {
        _layer[si].firstChild.remove();
      } else {
        _layer[si].firstChild.innerHTML = si + ".";
      }
    }
    updateLayerCodes(_layer.length - 1);
  }

  function addCombo(name) {
    const _editing = document.querySelector(".combo.editing");
    const i = _editing ? [].slice.call(_combo).indexOf(_editing) : -1;
    const _new_combo = document.createElement("div");
    const _new_left = document.createElement("div");
    const _new_right = document.createElement("div");
    const _new_hint = document.createElement("div");
    const _new_except_toggle = document.createElement("div");
    const _new_except = document.createElement("div");
    _new_combo.classList.add("combo", "editing");
    _new_left.classList.add("left_combo", "editing");
    _new_right.classList.add("right_combo", "editing");
    _new_hint.classList.add("hint", "w", "l", "a", "m", "i", "editing");
    _new_except_toggle.classList.add("showcase", "advanced");
    _new_except.classList.add("showcase", "except");
    if (i == -1) {
      _combos.append(_new_combo);
      _left.append(_new_left);
      _right.append(_new_right);
      _combo_hints.append(_new_hint);
      _exceptions.append(_new_except_toggle, _new_except);
    } else {
      _combo[i].after(_new_combo);
      _left_combo[i].after(_new_left);
      _right_combo[i].after(_new_right);
      _combo_hint[i].after(_new_hint);
      document.querySelectorAll("#exceptions .showcase.except")[i].after(_new_except_toggle, _new_except);
    }
    _new_left.innerHTML = "<div class='col c0'><div class='legend l8'></div></div><div class='col c1'><div class='legend l9'></div><div class='legend l20'></div></div><div class='col c2'><div class='legend l0'></div><div class='legend l10'></div><div class='legend l21'></div></div><div class='col c3'><div class='legend l1'></div><div class='legend l11 combo_pos'><p>　</p></div><div class='legend l22'></div></div><div class='col c4'><div class='legend l2'></div><div class='legend l12'></div><div class='legend l23'></div></div><div class='col c5'><div class='legend l3'></div><div class='legend l13'></div></div><div class='row r0'><div class='legend l28'></div><div class='legend l29'></div></div>";
    _new_right.innerHTML = "<div class='col c6'><div class='legend l4'></div><div class='legend l14'></div></div><div class='col c7'><div class='legend l5'></div><div class='legend l15'></div><div class='legend l24'></div></div><div class='col c8'><div class='legend l6'></div><div class='legend l16 combo_pos'><p>　</p></div><div class='legend l25'></div></div><div class='col c9'><div class='legend l7'></div><div class='legend l17'></div><div class='legend l26'></div></div><div class='col ca'><div class='legend l18'></div><div class='legend l27'></div></div><div class='col cb'><div class='legend l19'></div></div><div class='row r1'><div class='legend l30'></div><div class='legend l31'></div></div>";
    show(_new_combo);
    moveComboHint();
    const newName = findNewName(_combo, (name.target ? "none" : name), 1);
    _new_combo.innerHTML = "<input type='text' value='" + newName + "'/>";
    _new_hint.innerHTML = '<p><span class="mono">&amp;none</span>send nothing</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div>';
    _new_except_toggle.innerHTML = '<div><p>except “' + newName + '”</p><input type="checkbox" class="except_toggle"/></div>';
    _new_except.innerHTML = '<div><p>　timeout-ms</p><input class="c_e_tm" type="number" step="25" min="0" value="" placeholder="50"/></div><div><p>　require-prior-idle-ms</p><input class="c_e_rpim" type="number" step="25" min="0" value="" placeholder="-1"/></div><div><p>　slow-release</p><input class="c_e_sr" type="checkbox"/></div><div><p>　layers</p><input class="c_e_l" type="text" value="" placeholder="-1"/></div>';
    _new_combo.addEventListener("click", comboClick);
    _new_combo.lastChild.addEventListener("focus", nameFocus);
    _new_combo.lastChild.addEventListener("blur", nameBlur);
  }

  function removeCombo(ignore) {
    if (ignore != true) {
      if (!window.confirm('Are you sure to discard this combo?')) return;
    }
    const _editing = document.querySelector(".combo.editing");
    const i = [].slice.call(_combo).indexOf(_editing);
    if (_combo.length > 1) { // まだcomboが1つ以上残る場合
      show(_combo[Math.abs(i - 1)]);
    } else { // これでcomboが1つも無くなってしまう場合
      show(_layer[_layer.length - 1]);
    }
    _editing.removeEventListener("click", comboClick);
    _editing.lastChild.removeEventListener("focus", nameFocus);
    _editing.lastChild.removeEventListener("blur", nameBlur);
    _editing.remove();
    _left_combo[i].remove();
    _right_combo[i].remove();
    _combo_hint[i].remove();
    document.querySelectorAll("#exceptions .showcase.advanced")[i].remove();
    document.querySelectorAll("#exceptions .showcase.except")[i].remove();
  }

  function grabbingStart(exception) {
    _filter.classList.add("weak");
    for (let i = 0; i < _tag.length; i++) {
      _tag[i].classList.add("weak");
    }
    if (exception == "kp") {
      _code[0].classList.add("weak");
      _code[1].classList.add("weak");
      const start = [].slice.call(_code).indexOf(document.querySelector(".code.kp_end")) + 1;
      for (let i = start; i < _code.length; ++i) {
        _code[i].classList.add("weak");
      }
    } else if (exception == "hold") {
      for (let i = 0; i < _code.length; i++) {
        if (_code[i].querySelector("p.mod, p.lay")) continue;
        _code[i].classList.add("weak");
      }
    } else {
      for (let i = 0; i < _code.length; i++) {
        if (_code[i].querySelector(exception)) continue;
        _code[i].classList.add("weak");
      }
    }
    _make_custom.classList.add("weak");
    _help_toggle.classList.add("weak");
    _conf_toggle.classList.add("weak");
    _header[0].classList.add("weak");
    _header[1].classList.add("weak");
    _l_keymap.classList.add("weak");
    _s_keymap.classList.add("weak");
  }

  function grabbingEnd() {
    _filter.classList.remove("weak");
    for (let i = 0; i < _tag.length; i++) {
      _tag[i].classList.remove("weak");
    }
    for (let i = 0; i < _code.length; i++) {
      _code[i].classList.remove("weak");
    }
    _make_custom.classList.remove("weak");
    _help_toggle.classList.remove("weak");
    _conf_toggle.classList.remove("weak");
    _header[0].classList.remove("weak");
    _header[1].classList.remove("weak");
    _l_keymap.classList.remove("weak");
    _s_keymap.classList.remove("weak");
    _grabbing.remove();
    _grabbing = null;
    if (_swap) {
      _swap.classList.remove("weak");
      _swap = null;
      _swap_key = null;
    }
  }

  function nameFocus(e) {
    lastName = e.target.value;
  }

  function nameBlur(e) {
    if (e.target.value.length >= 16 || /^[0-9a-zA-Z_]+$/.test(e.target.value) == false) {
      alert("layer/combo's name must be short and alphanumerical!");
      e.target.value = lastName;
      return;
    }
    if (e.target.closest(".layer")) {
      e.target.value = findNewName(_layer, e.target.value, 1);
    } else {
      const i = [].slice.call(_combo).indexOf(e.target.closest(".combo"));
      _exceptions.querySelectorAll(".advanced p")[i].innerHTML = "except “" + e.target.value + "”";
      e.target.value = findNewName(_combo, e.target.value, 1);
    }
  }

  function show(target, ignore) { // 編集中のlayer/comboを切り替える
    if (editingLayer) {
      document.querySelector(".layer.editing").classList.remove("editing");
      document.querySelector(".left_layer.editing").classList.remove("editing");
      document.querySelector(".right_layer.editing").classList.remove("editing");
    } else {
      document.querySelector(".combo.editing").classList.remove("editing");
      document.querySelector(".left_combo.editing").classList.remove("editing");
      document.querySelector(".right_combo.editing").classList.remove("editing");
      document.querySelector(".hint.editing").classList.remove("editing");
    }
    target.classList.add("editing");
    if (target.classList.contains("layer")) { // layerの場合
      const i = [].slice.call(_layer).indexOf(target.closest(".layer"));
      _left_layer[i].classList.add("editing");
      _right_layer[i].classList.add("editing");
      for (let i = 0; i < _key.length; i++) {
        if (document.querySelector(".editing .l" + _key[i].id.slice(1) + " .trans")) {
          _key[i].classList.add("weak");
        } else {
          _key[i].classList.remove("weak");
        }
      }
      if (_remove_layer.classList.contains("disabled") && _layer.length > 1) {
        _remove_layer.classList.remove("disabled");
        _remove_combo.classList.add("disabled");
      }
      if (!_remove_combo.classList.contains("disabled")) {
        _remove_combo.classList.add("disabled");
      }
      editingLayer = true;
    } else { // comboの場合
      const i = [].slice.call(_combo).indexOf(target.closest(".combo"));
      _left_combo[i].classList.add("editing");
      _right_combo[i].classList.add("editing");
      _combo_hint[i].classList.add("editing");
      for (let i = 0; i < _key.length; i++) {
        if (document.querySelector(".editing .l" + _key[i].id.slice(1) + ".combo_pos")) {
          _key[i].classList.remove("weak");
        } else {
          _key[i].classList.add("weak");
        }
      }
      if (!_remove_layer.classList.contains("disabled")) {
        _remove_layer.classList.add("disabled");
      }
      if (_remove_combo.classList.contains("disabled")) {
        _remove_combo.classList.remove("disabled");
        _remove_layer.classList.add("disabled");
      }
      editingLayer = false;
    }
    if (!ignore) _last_shown = target;
  }

  function updateLayerCodes(layerCount) {
    const _dolc = document.getElementsByClassName("dolc"); // code elements that depend on layer count
    while (_dolc.length) {
      _dolc[0].removeEventListener("click", codeClick);
      _dolc[0].remove();
    }
    let codes_mo, codes_to, codes_tog, codes_sl;
    codes_mo = codes_to = codes_tog = codes_sl = "";
    for (let i = 1; i <= layerCount; ++i) {
      codes_mo += '<div class="code dolc" data-names="mo' + i + '"><p class="lay">L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;mo ' + i + '</span>enable layer ' + i + ' while pressing</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
      codes_to += '<div class="code dolc" data-names="to' + i + '"><p>To<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;to ' + i + '</span>enable layer ' + i + ' and disables others except the default layer</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
      codes_tog += '<div class="code dolc" data-names="tog' + i + '"><p>Toggle<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;tog ' + i + '</span>enable/disable layer ' + i + '</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
      codes_sl += '<div class="code dolc" data-names="sl' + i + '"><p>Sticky<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;sl ' + i + '</span>apply layer ' + i + ' to next keypress</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
    }
    const temp = document.createElement("div");
    const temp2 = document.createElement("div");
    document.getElementById("after_tog").before(temp);
    document.getElementById("after_sl").before(temp2);
    temp.outerHTML = codes_mo + codes_to + codes_tog;
    temp2.outerHTML = codes_sl;
    for (let i = 0; i < _dolc.length; i++) {
      _dolc[i].addEventListener("click", codeClick);
    }
  }

  function moveComboHint() {
    const _hint = document.querySelector(".hint.editing");
    const _pos = document.querySelectorAll(".editing .combo_pos");
    let x = 0;
    let y = 0
    for (let i = 0; i < _pos.length; i++) {
      const box = _pos[i].getBoundingClientRect();
      x += box.left + box.right;
      y += box.top + box.bottom;
    }
    _hint.style.left = (x / _pos.length * .5) + "px";
    _hint.style.bottom = "calc(100% - " + (y / _pos.length * .5) + "px + 1.5rem)";
  }

  function helpToggle() {
    if (_help.classList.contains("disabled")) {
      _upper.classList.add("weak");
      _lower.classList.add("weak");
      _conf_toggle.classList.add("weak");
      _help.classList.remove("disabled");
      _help_toggle.innerHTML = '<span class="material-symbols-rounded">close</span>';
    } else {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _conf_toggle.classList.remove("weak");
      _help.classList.add("disabled");
      _help_toggle.innerHTML = '<span class="material-symbols-rounded">info</span>';
    }
  }

  function confToggle() {
    if (_conf.classList.contains("disabled")) {
      _upper.classList.add("weak");
      _lower.classList.add("weak");
      _help_toggle.classList.add("weak");
      _conf.classList.remove("disabled");
      _conf_toggle.innerHTML = '<span class="material-symbols-rounded">close</span>';
    } else {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _help_toggle.classList.remove("weak");
      _conf.classList.add("disabled");
      _conf_toggle.innerHTML = '<span class="material-symbols-rounded">tune</span>';
    }
  }

  function togglePreset() {
    if (_preset.classList.contains("disabled")) {
      _upper.classList.add("weak");
      _lower.classList.add("weak");
      _conf_toggle.classList.add("weak");
      _help_toggle.classList.add("weak");
      _preset.classList.remove("disabled");
    } else {
      _upper.classList.remove("weak");
      _lower.classList.remove("weak");
      _conf_toggle.classList.remove("weak");
      _help_toggle.classList.remove("weak");
      _preset.classList.add("disabled");
    }
  }

  function loadPreset() {
    if (!window.confirm('Are you sure to discard current keymap and configuration?')) return;
    let option = document.getElementById("r_onishi").checked ? "_onishi" : "_qwerty";
    option += document.getElementById("r_win").checked ? "_win" : "_mac";
    option += document.getElementById("r_ansi").checked ? "_ansi" : "_jis";
    if(option == "_onishi_win_ansi") option = "";
    const url = "https://raw.githubusercontent.com/TakumaOnishi/zmk-config-fish/master/config/boards/shields/fish/fish" + option +".keymap"
    fetch(url).then(r => { return r.text() }).then(t => {
      loadInputChange(t);
    });
    togglePreset();
  }

  function saveClick() {
    const keymap = makeKeymap();
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([keymap], { type: 'text/plain' }));
    a.download = "fish.keymap";
    a.click();
  }

  function buildClick() {
    if(controller){
      document.getElementById("s_firmware").classList.remove("building");
      controller.abort("build canceled");
      controller = null;
      clearTimeout(timeoutID);
      return;
    }
    document.getElementById("s_firmware").classList.add("building");
    progress(0);
    controller = new AbortController();
    const url = 'https://o24.studio/build';
    const head = {
      'Content-type': 'application/json; charset=UTF-8'
    };
    const request = {
      "keymap": makeKeymap(),
      "conf": document.getElementById("c_cf").value,
      "defconfig": makeDefConfig()
    };
    fetch(url, {signal: controller.signal, method: "POST", headers: head, body: JSON.stringify(request)})
    .then(response => response.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = "fish_firmware.zip";
      a.click();
      document.getElementById("s_firmware").classList.remove("building");
    })
    .catch((error) => {
      alert(error);
      document.getElementById("s_firmware").classList.remove("building");
    });
  }

  function makeKeymap() {
    let t = '// キーマップを更新する方法は https://o24.works/fish/guide を参照\n// 視覚的に編集するには https://o24.works/fish/editor を参照\n\n\n// 定義を呼んでくる\n#include <behaviors.dtsi>\n#include <dt-bindings/zmk/keys.h>\n#include <dt-bindings/zmk/mouse.h>\n#include <dt-bindings/zmk/bt.h>\n#include <dt-bindings/zmk/outputs.h>\n\n\n// 特殊入力の挙動を調整できる\n\n&mt {';
    // mod tap
    t += '\n    flavor = "' + document.getElementById("c_mt_f").value + '";';
    if (document.getElementById("c_mt_ttm").value) t += '\n    tapping-term-ms = <' + document.getElementById("c_mt_ttm").value + '>;';
    if (document.getElementById("c_mt_qtm").value) t += '\n    quick-tap-ms = <' + document.getElementById("c_mt_qtm").value + '>;';
    if (document.getElementById("c_mt_rpim").value) t += '\n    require-prior-idle-ms = <' + document.getElementById("c_mt_rpim").value + '>;';
    if (document.getElementById("c_mt_rt").checked) t += '\n    retro-tap;';
    if (document.getElementById("c_mt_hwu").checked) t += '\n    hold-while-undecided;';
    if (document.getElementById("c_mt_hwul").checked) t += '\n    hold-while-undecided-linger;';
    if (document.getElementById("c_mt_htor").checked) t += '\n    hold-trigger-on-release;';
    if (document.getElementById("c_mt_htkp").value) t += '\n    hold-trigger-key-positions = <' + document.getElementById("c_lt_htkp").value + '>;';
    // layer tap
    t += '\n};\n\n&lt {';
    t += '\n    flavor = "' + document.getElementById("c_lt_f").value + '";';
    if (document.getElementById("c_lt_ttm").value) t += '\n    tapping-term-ms = <' + document.getElementById("c_lt_ttm").value + '>;';
    if (document.getElementById("c_lt_qtm").value) t += '\n    quick-tap-ms = <' + document.getElementById("c_lt_qtm").value + '>;';
    if (document.getElementById("c_lt_rpim").value) t += '\n    require-prior-idle-ms = <' + document.getElementById("c_lt_rpim").value + '>;';
    if (document.getElementById("c_lt_rt").checked) t += '\n    retro-tap;';
    if (document.getElementById("c_lt_hwu").checked) t += '\n    hold-while-undecided;';
    if (document.getElementById("c_lt_hwul").checked) t += '\n    hold-while-undecided-linger;';
    if (document.getElementById("c_lt_htor").checked) t += '\n    hold-trigger-on-release;';
    if (document.getElementById("c_lt_htkp").value) t += '\n    hold-trigger-key-positions = <' + document.getElementById("c_lt_htkp").value + '>;';
    // sticky key
    t += '\n};\n\n&sk {';
    if (document.getElementById("c_sk_ram").value) t += '\n    release-after-ms = <' + document.getElementById("c_sk_ram").value + '>;';
    if (document.getElementById("c_sk_qr").checked) t += '\n    quick-release;';
    if (document.getElementById("c_sk_l").checked) t += '\n    lazy;';
    if (!document.getElementById("c_sk_im").checked) t += '\n    /delete-property/ ignore-modifiers;';
    // sticky layer
    t += '\n};\n\n&sl {';
    if (document.getElementById("c_sl_ram").value) t += '\n    release-after-ms = <' + document.getElementById("c_sl_ram").value + '>;';
    if (!document.getElementById("c_sl_qr").checked) t += '\n    /delete-property/ quick-release;';
    if (document.getElementById("c_sl_l").checked) t += '\n    lazy;';
    if (!document.getElementById("c_sl_im").checked) t += '\n    /delete-property/ ignore-modifiers;';
    // caps word
    t += '\n};\n\n&caps_word {';
    if (document.getElementById("c_cw_cl").value) t += '\n    continue-list = <' + document.getElementById("c_cw_cl").value + '>;';
    if (document.getElementById("c_cw_m").value) t += '\n    mods = <' + document.getElementById("c_cw_m").value + '>;';
    // key repeat
    t += '\n};\n\n&key_repeat {';
    if (document.getElementById("c_kr").value) t += '\n    usage-pages = <' + document.getElementById("c_kr").value + '>;';
    // custom behavior
    t += '\n};\n\n\n/ {\n    // 独自の入力を定義できる（上級者向け）\n\n';
    t += document.getElementById("c_cb").value;
    // combo
    t += '\n\n\n    // 複数キーの同時押しに特別の入力を設定できる\n    // キー番号早見表：\n    //       0  1  2  3     4  5  6  7\n    // 8  9 10 11 12 13    14 15 16 17 18 19\n    //   20 21 22 23          24 25 26 27\n    //            28 29    30 31\n\n    combos {';
    t += '\n        compatible = "zmk,combos";';
    if (document.getElementById("c_c_tm").value) t += '\n        timeout-ms = <' + document.getElementById("c_c_tm").value + '>;';
    if (document.getElementById("c_c_rpim").value) t += '\n        require-prior-idle-ms = <' + document.getElementById("c_c_rpim").value + '>;';
    if (document.getElementById("c_c_sr").checked) t += '\n        slow-release;';
    if (document.getElementById("c_c_l").value) t += '\n        layers = <' + document.getElementById("c_c_l").value + '>;';
    for (let i = 0; i < _combo.length; i++) {
      show(_combo[i], true);
      let pos = "";
      for (let ki = 0; ki < 32; ki++) {
        if (document.querySelector(".editing .l" + ki).classList.contains("combo_pos")) {
          pos += ki + " ";
        }
      }
      t += "\n\n        combo_" + _combo[i].firstChild.value + " {\n            key-positions = <" + pos.trim() + ">;\n            bindings = <&" + document.querySelector(".hint.editing .mono").innerHTML.substring(5) + ">;";
      if (document.getElementsByClassName("except_toggle")[i].checked) {
        if (document.getElementsByClassName("c_e_tm")[i].value) t += '\n            timeout-ms = <' + document.getElementsByClassName("c_e_tm")[i].value + '>;';
        if (document.getElementsByClassName("c_e_rpim")[i].value) t += '\n            require-prior-idle-ms = <' + document.getElementsByClassName("c_e_rpim")[i].value + '>;';
        if (document.getElementsByClassName("c_e_sr")[i].checked) t += '\n            slow-release;';
        if (document.getElementsByClassName("c_e_l")[i].value) t += '\n            layers = <' + document.getElementsByClassName("c_e_l")[i].value + '>;';
      }
      t += "\n        };";
    }
    t += '\n    };\n    \n\n    // キーに入力を割り当てる\n    // 型（&...）は https://zmk.dev/docs/behaviors/... を参照\n    // キーコードは https://zmk.dev/docs/codes/... を参照\n\n    keymap {\n        compatible = "zmk,keymap";';
    for (let i = 0; i < _layer.length; i++) {
      show(_layer[i], true);
      t += "\n\n        layer_" + _layer[i].lastChild.value + " {\n            bindings = <\n                        ";
      let debt = 0;
      for (let ki = 0; ki < 32; ki++) {
        const code = document.querySelector(".editing .l" + ki + " .mono").innerHTML.substring(5);
        let room = 11;
        if (ki == 3 || ki == 13 || ki == 29) room = 19;
        if (ki == 23) room = 43;
        t += "&" + code + " ".repeat(Math.max(1, room - debt - code.length));
        debt = Math.max(0, debt + code.length + 1 - room);
        switch (ki) {
          case 7:
            t += "\n";
            debt = 0;
            break;
          case 19:
            t += "\n            ";
            debt = 0;
            break;
          case 27:
            t += "\n                                                ";
            debt = 0;
            break;
          default:
            break;
        }
      }
      t += "\n            >;\n        };";
    }
    t += "\n    };\n};";
    show(_last_shown);
    //console.log(t);
    return t;
  }

  function makeDefConfig() {
    const side = document.getElementById("c_rc").checked ? "RIGHT" : "LEFT";
    return "if SHIELD_FISH_" + side + "\nconfig ZMK_KEYBOARD_NAME\n    default \"Fish Keyboard\"\nconfig ZMK_SPLIT_ROLE_CENTRAL\n    default y\nendif\n\nif SHIELD_FISH_LEFT || SHIELD_FISH_RIGHT\nconfig ZMK_SPLIT\n    default y\nendif";
  }

  function progress(percent) {
    document.getElementById("b_progress").innerText = percent + "%";
    document.getElementById("b_bar_inner").style.width = percent + "%";
    if(percent == 99) return;
    timeoutID = setTimeout(()=>{
      progress(percent+1);
    }, 2000);
  }

  async function loadInputChange(eventOrText) {
    let tx;
    if (eventOrText.isTrusted) { // eventの場合
      let file = _l_keymap_input.files[0];
      if (!file) return;
      tx = await fetchAsText(file);
    } else {
      tx = eventOrText;
    }
    for (let i = _layer.length - 1; i > 0; i--) {
      show(_layer[i]);
      removeLayer(true);
    }
    for (let i = _combo.length - 1; i >= 0; i--) {
      show(_combo[i]);
      removeCombo(true);
    }
    while (tx.includes("//")) { // コメントの行を削除
      let start = tx.indexOf("//");
      let end = tx.indexOf("\n", start);
      tx = tx.substring(0, start) + (end == -1 ? "" : tx.substring(end));
    }
    const t = tx.replace(/\s+/g, ""); // スペースを削除
    let s, e, sx, ex, subt;
    // mod-tap
    s = tx.indexOf("\n", tx.search(/&mt\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_mt_f").value = selectConf(subt, "flavor", "tap-preferred");
      document.getElementById("c_mt_ttm").value = loadConf(subt, "tapping-term-ms");
      document.getElementById("c_mt_qtm").value = loadConf(subt, "quick-tap-ms");
      document.getElementById("c_mt_rpim").value = loadConf(subt, "require-prior-idle-ms");
      document.getElementById("c_mt_rt").checked = checkConf(subt, "retro-tap", false);
      document.getElementById("c_mt_hwu").checked = checkConf(subt, "hold-while-undecided", false);
      document.getElementById("c_mt_hwul").checked = checkConf(subt, "hold-while-undecided-linger", false);
      document.getElementById("c_mt_htor").checked = checkConf(subt, "hold-trigger-on-release", false);
      document.getElementById("c_mt_htkp").value = loadConf(subt, "hold-trigger-key-positions");
    }
    // layer-tap
    s = tx.indexOf("\n", tx.search(/&lt\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_lt_f").value = selectConf(subt, "flavor", "tap-preferred");
      document.getElementById("c_lt_ttm").value = loadConf(subt, "tapping-term-ms");
      document.getElementById("c_lt_qtm").value = loadConf(subt, "quick-tap-ms");
      document.getElementById("c_lt_rpim").value = loadConf(subt, "require-prior-idle-ms");
      document.getElementById("c_lt_rt").checked = checkConf(subt, "retro-tap", false);
      document.getElementById("c_lt_hwu").checked = checkConf(subt, "hold-while-undecided", false);
      document.getElementById("c_lt_hwul").checked = checkConf(subt, "hold-while-undecided-linger", false);
      document.getElementById("c_lt_htor").checked = checkConf(subt, "hold-trigger-on-release", false);
      document.getElementById("c_lt_htkp").value = loadConf(subt, "hold-trigger-key-positions");
    }
    // sticky key
    s = tx.indexOf("\n", tx.search(/&sk\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_sk_ram").value = loadConf(subt, "release-after-ms");
      document.getElementById("c_sk_qr").checked = checkConf(subt, "quick-release", false);
      document.getElementById("c_sk_l").checked = checkConf(subt, "lazy", false);
      document.getElementById("c_sk_im").checked = checkConf(subt, "ignore-modifiers", true);
    }
    // sticky layer
    s = tx.indexOf("\n", tx.search(/&sl\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_sl_ram").value = loadConf(subt, "release-after-ms");
      document.getElementById("c_sl_qr").checked = checkConf(subt, "quick-release", true);
      document.getElementById("c_sl_l").checked = checkConf(subt, "lazy", false);
      document.getElementById("c_sl_im").checked = checkConf(subt, "ignore-modifiers", true);
    }
    // caps word
    s = tx.indexOf("\n", tx.search(/&caps_word\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_cw_cl").value = loadConf(subt, "continue-list");
      document.getElementById("c_cw_m").value = loadConf(subt, "mods");
    }
    // key repeat
    s = tx.indexOf("\n", tx.search(/&key_repeat\s*\{/));
    if (s != -1) {
      e = tx.indexOf("}", s);
      subt = tx.substring(s, e);
      document.getElementById("c_kr").value = loadConf(subt, "usage-pages");
    }
    // custom behaviors
    s = tx.indexOf("\n", tx.search(/\/\s*\{/));
    e = Math.min(tx.search(/combos\s*\{/), tx.search(/keymap\s*\{/));
    document.getElementById("c_cb").value = "    " + tx.substring(s, e).trim();
    // combo
    s = tx.indexOf("\n", tx.search(/combos\s*\{/));
    if (s != 1) {
      e = tx.lastIndexOf("\n", Math.min(tx.indexOf("{", s), tx.indexOf("}", s)));
      subt = tx.substring(s, e);
      document.getElementById("c_c_tm").value = loadConf(subt, "timeout-ms");
      document.getElementById("c_c_rpim").value = loadConf(subt, "require-prior-idle-ms");
      document.getElementById("c_c_sr").checked = checkConf(subt, "slow-release", false);
      document.getElementById("c_c_l").value = loadConf(subt, "layers");
      for (let i = 0; i < 999; i++) {
        // name
        s = e;
        e = tx.indexOf("{", s);
        if (tx.indexOf("}", s) < e || e == -1) break; // １個もなくても大丈夫
        let name = tx.substring(s, e).trim();
        name = name.substring(0, 6) == "combo_" ? name.substring(6) : name;
        addCombo(name);
        // bindings
        s = tx.indexOf("\n", e);
        e = tx.indexOf("\n", tx.indexOf("}", s));
        subt = tx.substring(s, e);
        const code = loadConf(subt, "bindings").replace("&", "").replaceAll(" ", "");
        const _temp = document.createElement("div");
        _temp.innerHTML = _code[0].innerHTML; // &noneのコピー要素から始める
        loadKey(code, _temp);
        _temp.querySelector(".hint").classList.add("editing");
        document.querySelector("#combo_hints .hint.editing").outerHTML = _temp.querySelector(".hint").outerHTML;
        _temp.querySelector(".hint").remove();
        // key-positions
        document.querySelector(".editing .l11").classList.remove("combo_pos");
        document.querySelector(".editing .l16").classList.remove("combo_pos");
        const pos = loadConf(subt, "key-positions").split(" ");
        for (let i = 0; i < pos.length; i++) {
          const _legend = document.querySelector(".editing .l" + pos[i]);
          _legend.classList.add("combo_pos");
          _legend.innerHTML = _temp.innerHTML;
        }
        _temp.remove();
        moveComboHint();
        // configs
        let c = [];
        c[0] = document.getElementsByClassName("c_e_tm")[i].value = loadConf(subt, "timeout-ms");
        c[1] = document.getElementsByClassName("c_e_rpim")[i].value = loadConf(subt, "require-prior-idle-ms");
        c[2] = document.getElementsByClassName("c_e_sr")[i].checked = checkConf(subt, "slow-release", false);
        c[3] = document.getElementsByClassName("c_e_l")[i].value = loadConf(subt, "layers");
        if (c[0] || c[1] || c[2] != document.getElementById("c_c_sr").checked || c[3]) document.getElementsByClassName("except_toggle")[i].checked = true;
      }
    }
    // keymap
    show(_layer[0]);
    s = t.lastIndexOf(";", t.indexOf("{", t.indexOf("keymap{") + 7)) + 1;
    for (let i = 0; i < 999; i++) { // レイヤー
      if (i > 0) addLayer(true);
      const name = t.substring(s, t.indexOf("{", s));
      _layer[i].lastChild.value = name.substring(0, 6) == "layer_" ? name.substring(6) : name;
      let ks = t.indexOf("&", s) + 1;
      let ke = t.indexOf("&", ks);
      for (let ki = 0; ki < 32; ki++) { // キー
        const _legend = document.querySelector(".editing .l" + ki);
        const code = t.substring(ks, ke);
        loadKey(code, _legend);
        ks = ke + 1;
        ke = (ki != 30) ? t.indexOf("&", ks) : t.indexOf(">", ks);
      }
      s = t.indexOf("};", s) + 2;
      if (t.charAt(s) == "}") break;
    }
    // finish
    updateOS();
    show(_layer[0]);
  }

  let fetchAsText = (file) => {
    return new Promise((resolve) => {
      let fr = new FileReader();
      fr.onload = (e) => {
        resolve(e.currentTarget.result);
      }
      fr.readAsText(file);
    });
  };

  function selectConf(text, name, defv) {
    const regex = new RegExp(name + "\\s*=");
    if (!regex.test(text)) { // leave default
      return defv;
    } else {
      s = text.indexOf('"', text.search(regex)) + 1;
      e = text.indexOf('"', s);
      return text.substring(s, e).trim();
    }
  }

  function loadConf(text, name) {
    const regex = new RegExp(name + "\\s*=");
    if (!regex.test(text)) { // leave default
      return "";
    } else {
      s = text.indexOf('<', text.search(regex)) + 1;
      e = text.indexOf('>', s);
      return text.substring(s, e).trim();
    }
  }

  function checkConf(text, name, defv) { // default value
    if (new RegExp(name + "\\s*;").test(text)) {
      return !new RegExp("/delete-property/\\s*" + name + "\\s*;").test(text);
    } else {
      return defv;
    }
  }

  function loadKey(code, _legend) {
    if (code.substring(0, 2) == "mt") { // mod-tap
      let holdP, holdCode;
      if (code.substring(2, 7) == "LSHFT" || code.substring(2, 8) == "LSHIFT" || code.substring(2, 12) == "LEFT_SHIFT") {
        holdP = "Shift";
        holdCode = "LSHFT";
      } else if (code.substring(2, 7) == "RSHFT" || code.substring(2, 8) == "RSHIFT" || code.substring(2, 13) == "RIGHT_SHIFT") {
        holdP = "RShift";
        holdCode = "RSHFT";
      } else if (code.substring(2, 7) == "LCTRL" || code.substring(2, 14) == "LEFT_CONTROL") {
        holdP = "Ctrl";
        holdCode = "LCTRL";
      } else if (code.substring(2, 7) == "RCTRL" || code.substring(2, 15) == "RIGHT_CONTROL") {
        holdP = "RCtrl";
        holdCode = "RCTRL";
      } else if (code.substring(2, 6) == "LALT" || code.substring(2, 10) == "LEFT_ALT") {
        holdP = '<span class="os w l a">Alt</span><span class="os m i">Opt</span>';
        holdCode = "LALT";
      } else if (code.substring(2, 6) == "RALT" || code.substring(2, 11) == "RIGHT_ALT") {
        holdP = 'R<span class="os w l a">Alt</span><span class="os m i">Opt</span>';
        holdCode = "RALT";
      } else if (code.substring(2, 6) == "LGUI" || code.substring(2, 6) == "LWIN" || code.substring(2, 6) == "LCMD" || code.substring(2, 7) == "LMETA" || code.substring(2, 10) == "LEFT_GUI" || code.substring(2, 10) == "LEFT_WIN" || code.substring(2, 11) == "LEFT_META" || code.substring(2, 14) == "LEFT_COMMAND") {
        holdP = '<span class="os w">Win</span><span class="os l a">GUI</span><span class="os m i">Cmd</span>';
        holdCode = "LGUI";
      } else if (code.substring(2, 6) == "RGUI" || code.substring(2, 6) == "RWIN" || code.substring(2, 6) == "RCMD" || code.substring(2, 7) == "RMETA" || code.substring(2, 11) == "RIGHT_GUI" || code.substring(2, 11) == "RIGHT_WIN" || code.substring(2, 12) == "RIGHT_META" || code.substring(2, 15) == "RIGHT_COMMAND") {
        holdP = 'R<span class="os w">Win</span><span class="os l a">GUI</span><span class="os m i">Cmd</span>';
        holdCode = "RGUI";
      }
      const match = findKey("kp" + code.substring(holdCode.length + 2));
      if (match) {
        makeHoldTap(holdP, holdCode, match, _legend);
        return;
      }
    } else if (code.substring(0, 2) == "lt") { // layer-tap
      const holdCode = code.substring(2, code.search(/[A-Z]/));
      const match = findKey("kp" + code.substring(code.search(/[A-Z]/)));
      if (match) {
        makeHoldTap("L" + holdCode, holdCode, match, _legend);
        return;
      }
    } else if (code.includes("(")) { // moded kp
      code = code.substring(0, code.search(/[A-Z]/)) + " " + code.substring(code.search(/[A-Z]/));
      let dt = "";
      let lt = "";
      for (let i = 0; i < code.match(/\(/g).length; i++) {
        if (code.charAt(3 * i + 3) == "R") dt += "R";
        switch (code.charAt(3 * i + 4)) {
          case "S":
            dt += "Shift+";
            lt += "⇧";
            break;
          case "C":
            dt += "Ctrl+";
            lt += "⌃";
            break;
          case "G":
            dt += '<span class="os w">Win</span><span class="os l a">GUI</span><span class="os m i">Cmd</span>+';
            lt += "⌘";
            break;
          case "A":
            dt += '<span class="os w l a">Alt</span><span class="os m i">Opt</span>+';
            lt += "⌥";
            break;
        }
      }
      const match = findKey("kp" + code.substring(code.lastIndexOf("(") + 1, code.indexOf(")")));
      if (match) {
        const ml = match.firstChild.innerHTML;
        _legend.innerHTML = match.innerHTML;
        _legend.firstChild.innerHTML = lt + ml;
        _legend.firstChild.classList.remove("big");
        _legend.querySelector(".hint p").innerHTML = '<span class="mono">&amp;' + code + '</span>' + dt + ml;
        return;
      }
    } else { // single key
      const match = findKey(code);
      if (match) {
        _legend.innerHTML = match.innerHTML;
        return;
      }
    } // unlisted
    code = code.substring(0, code.search(/[A-Z0-9]/)) + " " + code.substring(code.search(/[A-Z0-9]/));
    _legend.innerHTML = '<p>' + code + '</p><div class="hint"><p><span class="mono">&amp;' + code + '</span>custom keycode</p></div>';
  }

  function findKey(code) {
    for (let ci = 0; ci < _code.length; ci++) {
      const names = _code[ci].dataset.names.split(" ");
      for (let ni = 0; ni < names.length; ni++) {
        if (names[ni] == code) {
          return _code[ci];
        }
      }
    }
    return null;
  }
});