// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener("DOMContentLoaded", () => { // 読み込みを待って処理を始める

   const _body = document.body;
   const _filter = document.getElementById("filter");
   const _select_os = document.getElementById("select_os"); // HTML要素を取得する
   const _os = document.getElementsByClassName("os");
   const _tag = document.getElementsByClassName("tag");
   const _code = document.getElementsByClassName("code");
   const _add_custom = document.getElementById("add_custom");
   const _help = document.getElementById("help");
   const _conf = document.getElementById("conf");
   const _key = document.getElementsByClassName("key");
   const _layers = document.getElementById("layers");
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
   const _header = document.getElementsByClassName("header")
   const _load = document.getElementById("load");
   const _load_input = document.querySelector("#load input");
   const _save = document.getElementById("save");
   const _combo_hints = document.getElementById("combo_hints");
   const _combo_hint = _combo_hints.children;

   let _grabbing = null
   let editingLayer = true;

   _body.addEventListener("click", bodyClick);
   _body.addEventListener("mousemove", bodyMove);
   _select_os.addEventListener("change", updateOS);
   for (let i = 0; i < _code.length; i++) {
      _code[i].addEventListener("click", codeClick);
   }
   _add_custom
   for (let i = 0; i < _key.length; i++) {
      _key[i].addEventListener("click", keyClick);
      _key[i].addEventListener("mouseenter", keyEnter);
      _key[i].addEventListener("mouseleave", keyLeave);
   }
   for (let i = 0; i < _layer.length; i++) {
      _layer[i].addEventListener("click", layerClick);
   }
   for (let i = 0; i < _combo.length; i++) {
      _combo[i].addEventListener("click", comboClick);
   }
   _remove_layer.addEventListener("click", removeLayer);
   document.getElementById("add_layer").addEventListener("click", addLayer);
   _remove_combo.addEventListener("click", removeCombo);
   document.getElementById("add_combo").addEventListener("click", addCombo);
   _help.addEventListener("click", helpClick);
   _conf.addEventListener("click", confClick);
   _load.addEventListener("click", ()=>{_load_input.click();});
   _load_input.addEventListener("change", loadInputChange);
   _save.addEventListener("click", saveClick);

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

   updateOS();

   function updateOS() {
      let s = _select_os.value;
      if (s != "") {
         for (let i = 0; i < _code.length; i++) {
            if(_code[i].classList.contains("custom")) continue;
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
      if(_grabbing){
         _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
      }
   }

   function keyEnter(e) {
      if(_grabbing) return;
      if(editingLayer){
         document.querySelector(".editing .l" + e.target.id.slice(1) + " .hint").classList.add("hover");
      }else if(!e.target.classList.contains("weak")){
         document.querySelector(".hint.editing").classList.add("hover");
      }
   }

   function keyLeave(e) {
      if(editingLayer){
         document.querySelector(".editing .l" + e.target.id.slice(1) + " .hint").classList.remove("hover");
      }else if(!e.target.classList.contains("weak")){
         document.querySelector(".hint.editing").classList.remove("hover");
      }
   }

   function bodyClick(e) { // つかみ中に関係ないとこクリックしたらキャンセル
      if (!_grabbing) return;
      if (e.target.closest(".code, .key, #map")) return;
      grabbingEnd();
   }

   function codeClick(e) {
      if (_grabbing){
         if (_grabbing.querySelector("span.mono").innerHTML.substring(5,7)=="kp" && !_grabbing.querySelector("p.mod") && e.target.querySelector("p.mod, p.lay")) {
            const holdP = e.target.querySelector("p").innerHTML.replace("<br>", "");
            const holdCode = e.target.querySelector("span.mono").innerHTML.substring(8);
            makeHoldTap(holdP, holdCode, _grabbing, _grabbing); // kp(mod以外) > hold => mt, lt
         }else if (_grabbing.querySelector("p.mod") && e.target.querySelector("span.mono").innerHTML.substring(5,7)=="kp") {
            makeModified(_grabbing, e.target, _grabbing); // (mod > ) mod > kp => modded 
         }
      }else{
         _grabbing = document.createElement("div");
         _grabbing.classList.add("grabbing");
         _grabbing.innerHTML = e.target.innerHTML;
         const box = e.target.getBoundingClientRect();
         _grabbing.style.top = (box.y - e.clientY) + "px";
         _grabbing.style.left = (box.x - e.clientX) + "px";
         _grabbing.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
         _body.append(_grabbing);
         if(_grabbing.querySelector("span.mono").innerHTML.substring(5,7)=="kp"){
            if(_grabbing.querySelector("p.mod")){
               grabbingStart("kp"); // can make modified
            }else{
               grabbingStart("hold"); // can make hold-tap
            }
         }else{
            grabbingStart();
         }
      }
   }

   function keyClick(e) {
      const _legend = document.querySelector(".editing .l" + e.target.id.slice(1));
      if (editingLayer) { // layer編集時
         if(_grabbing){
            if(_grabbing.querySelector("p.trans")){
               e.target.classList.add("weak");
            }else{
               e.target.classList.remove("weak");
            }
            _legend.innerHTML = _grabbing.innerHTML;
            _legend.querySelector(".hint").classList.add("hover");
            grabbingEnd();
         }else{
         }
      }else if(_grabbing){ // combo編集時
         e.target.classList.remove("weak");
         document.querySelector(".combo.editing input").value = _grabbing.querySelector("span.mono").innerHTML.substring(5).replace(/\s|\(/g, "_").replaceAll(/kp_|bt_|out_|mbp_|\)/g, "").toLowerCase();
         _legend.classList.add("combo_pos");
         const _hint = document.querySelector(".hint.editing");
         _grabbing.querySelector(".hint").classList.add("editing", "hover");
         _hint.outerHTML = _grabbing.querySelector(".hint").outerHTML;
         _grabbing.querySelector(".hint").remove();
         const _combo_pos = document.querySelectorAll(".editing .combo_pos");
         for(let i=0; i<_combo_pos.length; i++){
            _combo_pos[i].innerHTML = _grabbing.innerHTML;
         }
         grabbingEnd();
         moveComboHint();
      }else{
         if(e.target.classList.contains("weak")){
            _legend.innerHTML = document.querySelector(".editing .combo_pos").innerHTML;
            document.querySelector(".hint.editing").classList.add("hover");
         }else{
            if(document.querySelectorAll(".editing .combo_pos").length <= 2) return;
            _legend.innerHTML = "";
            document.querySelector(".hint.editing").classList.remove("hover");
         }
         e.target.classList.toggle("weak");
         _legend.classList.toggle("combo_pos");
         moveComboHint();
      }
   }

   function makeHoldTap(holdP, holdCode, _tap, _to){
      const tap = _tap.querySelector("p").innerHTML.replace("<br>", "");
      _to.querySelector("p").remove();
      const _new_p = document.createElement("p");
      _new_p.innerHTML = tap + "<br><span class='small'>(" + holdP + ")</span>";
      _to.prepend(_new_p);
      const type = isNaN(holdCode) ? "&amp;mt " : "&amp;lt ";
      const code = holdCode + " " + _tap.querySelector("span.mono").innerHTML.substring(8);
      const desc = tap + " when tapped, " + holdP + " when held";
      _to.querySelector(".hint p").innerHTML = "<span class='mono'>" + type + code + "</span>" + desc;
      if(_grabbing) grabbingStart();
   }

   function makeModified(_mod, _inner, _to){
      let mod;
      const inner = _inner.querySelector("p").innerHTML;
      const open = _mod.querySelector("p").dataset.open;
      const close = _mod.querySelector("p").dataset.close;
      const mark = _mod.querySelector("p").dataset.mark;
      const p = _mod.querySelector("p");
      if(p.dataset.close.length <= 1){
         mod = _mod.querySelector("p").innerHTML.replace("<br>", "");
      }else{
         const hintP = _mod.querySelector(".hint p").innerHTML;
         mod = hintP.substring(hintP.indexOf("</span>") + 7);
      }
      if(_inner.querySelector("p.mod")){
         p.dataset.open += _inner.querySelector("p").dataset.open;
         p.dataset.close += _inner.querySelector("p").dataset.close;
         p.dataset.mark += _inner.querySelector("p").dataset.mark;
         if(_grabbing) grabbingStart("kp");
      }else{
         p.classList.remove("mod");
         if(_grabbing) grabbingStart();
      }
      p.innerHTML = mark + inner;
      const innerCode = _inner.querySelector("span.mono").innerHTML.substring(8); // 必ず"&amp;kp "なので
      const desc = mod + "+" + inner;
      _to.querySelector(".hint").outerHTML = _inner.querySelector(".hint").outerHTML;
      _to.querySelector(".hint p").innerHTML = "<span class='mono'>&amp;kp " + open + innerCode + close + "</span>" + desc;
   }

   function layerClick(e) {
      if(e.target.closest(".layer").classList.contains("editing")) return; // closest()は自身を含む
      show(e.target);
   }

   function comboClick(e) {
      if(e.target.closest(".combo").classList.contains("editing")) return; // closest()は自身を含む
      show(e.target);
   }

   function addLayer() {
      const _new_layer = document.createElement("div");
      const _new_left = document.createElement("div");
      const _new_right = document.createElement("div");
      _new_layer.classList.add("layer", "editing");
      _new_left.classList.add("left_layer", "editing");
      _new_right.classList.add("right_layer", "editing");
      _new_layer.innerHTML = "<input type='text' value='" + String(_layer.length) + "_blank'/>";
      _new_left.innerHTML = "<div class='col c0'><div class='legend l8'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c1'><div class='legend l9'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l20'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c2'><div class='legend l0'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l10'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l21'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c3'><div class='legend l1'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l11'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l22'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c4'><div class='legend l2'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l12'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l23'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c5'><div class='legend l3'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l13'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='row r0'><div class='legend l28'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l29'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div>";
      _new_right.innerHTML = "<div class='col c6'><div class='legend l4'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l14'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c7'><div class='legend l5'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l15'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l24'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c8'><div class='legend l6'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l16'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l25'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col c9'><div class='legend l7'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l17'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l26'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col ca'><div class='legend l18'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l27'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='col cb'><div class='legend l19'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div><div class='row r1'><div class='legend l30'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div><div class='legend l31'><p class='trans'>　</p><div class='hint w l a m i'><p><span class='mono'>&amp;trans</span>transparent; send the keycode of the next active layer</p><div><img src='img/windows.svg'><img src='img/macos.svg'><img src='img/linux.svg'><img src='img/ios.svg'><img src='img/android.svg'></div></div></div></div>";
      _layers.append(_new_layer);
      _left_layer[_left_layer.length-1].after(_new_left);
      _right_layer[_right_layer.length-1].after(_new_right);
      _new_layer.addEventListener("click", layerClick);
      updateLayerCodes(_layer.length-1);
      show(_new_layer);
   }

   function removeLayer() {
      if(!window.confirm('Are you sure to erase this layer?')) return;
      const _editing = document.querySelector(".layer.editing");
      const i = [].slice.call(_layer).indexOf(_editing);
      show(_layer[Math.abs(i-1)]); // layer[0]を消そうとしてるときはlayer[1]に相続する
      _editing.removeEventListener("click", layerClick);
      _editing.remove();
      _left_layer[i].remove();
      _right_layer[i].remove();
      updateLayerCodes(_layer.length-1);
   }

   function addCombo() {
      const _new_combo = document.createElement("div");
      const _new_left = document.createElement("div");
      const _new_right = document.createElement("div");
      const _new_hint = document.createElement("div");
      _new_combo.classList.add("combo", "editing");
      _new_left.classList.add("left_combo", "editing");
      _new_right.classList.add("right_combo", "editing");
      _new_hint.classList.add("hint", "w", "l", "a", "m", "i", "editing");
      _new_combo.innerHTML = "<input type='text' value='none'/>";
      _new_left.innerHTML = "<div class='col c0'><div class='legend l8'></div></div><div class='col c1'><div class='legend l9'></div><div class='legend l20'></div></div><div class='col c2'><div class='legend l0'></div><div class='legend l10'></div><div class='legend l21'></div></div><div class='col c3'><div class='legend l1'></div><div class='legend l11 combo_pos'><p>　</p></div><div class='legend l22'></div></div><div class='col c4'><div class='legend l2'></div><div class='legend l12'></div><div class='legend l23'></div></div><div class='col c5'><div class='legend l3'></div><div class='legend l13'></div></div><div class='row r0'><div class='legend l28'></div><div class='legend l29'></div></div>";
      _new_right.innerHTML = "<div class='col c6'><div class='legend l4'></div><div class='legend l14'></div></div><div class='col c7'><div class='legend l5'></div><div class='legend l15'></div><div class='legend l24'></div></div><div class='col c8'><div class='legend l6'></div><div class='legend l16 combo_pos'><p>　</p></div><div class='legend l25'></div></div><div class='col c9'><div class='legend l7'></div><div class='legend l17'></div><div class='legend l26'></div></div><div class='col ca'><div class='legend l18'></div><div class='legend l27'></div></div><div class='col cb'><div class='legend l19'></div></div><div class='row r1'><div class='legend l30'></div><div class='legend l31'></div></div>";
      _new_hint.innerHTML = '<p><span class="mono">&amp;none</span>send nothing</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div>';
      _combos.append(_new_combo);
      _left.append(_new_left);
      _right.append(_new_right);
      _combo_hints.append(_new_hint);
      _new_combo.addEventListener("click", comboClick);
      show(_new_combo);
      moveComboHint();
   }

   function removeCombo() {
      if(!window.confirm('Are you sure to erase this combo?')) return;
      const _editing = document.querySelector(".combo.editing");
      const i = [].slice.call(_combo).indexOf(_editing);
      if(_combo.length > 1){ // まだcomboが1つ以上残る場合
         show(_combo[Math.abs(i-1)]);
      }else{ // これでcomboが1つも無くなってしまう場合
         show(_layer[_layer.length-1]);
      }
      _editing.removeEventListener("click", comboClick);
      _editing.remove();
      _left_combo[i].remove();
      _right_combo[i].remove();
      _combo_hint[i].remove();
   }

   function grabbingStart(exeption){
      _filter.classList.add("weak");
      for(let i=0; i<_tag.length; i++){
         _tag[i].classList.add("weak");
      }
      if(exeption == "kp"){
         _code[0].classList.add("weak");
         _code[1].classList.add("weak");
         const start = [].slice.call(_code).indexOf(document.querySelector(".code.kp_end")) + 1;
         for(let i=start; i<_code.length; ++i){
            _code[i].classList.add("weak");
         }
      }else if(exeption == "hold"){
         for(let i=0; i<_code.length; i++){
            if(_code[i].querySelector("p.mod, p.lay")) continue;
            _code[i].classList.add("weak");
         }
      }else{
         for(let i=0; i<_code.length; i++){
            if(_code[i].querySelector(exeption)) continue;
            _code[i].classList.add("weak");
         }
      }
      _add_custom.classList.add("weak");
      _help.classList.add("weak");
      _conf.classList.add("weak");
      _header[0].classList.add("weak");
      _header[1].classList.add("weak");
      _load.classList.add("weak");
      _save.classList.add("weak");
   }

   function grabbingEnd(){
      _filter.classList.remove("weak");
      for(let i=0; i<_tag.length; i++){
         _tag[i].classList.remove("weak");
      }
      for(let i=0; i<_code.length; i++){
         _code[i].classList.remove("weak");
      }
      _add_custom.classList.remove("weak");
      _help.classList.remove("weak");
      _conf.classList.remove("weak");
      _header[0].classList.remove("weak");
      _header[1].classList.remove("weak");
      _load.classList.remove("weak");
      _save.classList.remove("weak");
      _grabbing.remove();
      _grabbing = null;
   }

   function show(target){ // 編集中のlayer/comboを切り替える
      if(editingLayer){
         document.querySelector(".layer.editing").classList.remove("editing");
         document.querySelector(".left_layer.editing").classList.remove("editing");
         document.querySelector(".right_layer.editing").classList.remove("editing");
      }else{
         document.querySelector(".combo.editing").classList.remove("editing");
         document.querySelector(".left_combo.editing").classList.remove("editing");
         document.querySelector(".right_combo.editing").classList.remove("editing");
         document.querySelector(".hint.editing").classList.remove("editing");
      }
      target.classList.add("editing");
      if(target.classList.contains("layer")){ // layerの場合
         const i = [].slice.call(_layer).indexOf(target.closest(".layer"));
         _left_layer[i].classList.add("editing");
         _right_layer[i].classList.add("editing");
         for(let i=0; i<_key.length; i++){
            if(document.querySelector(".editing .l" + _key[i].id.slice(1) + " .trans")){
               _key[i].classList.add("weak");
            }else{
               _key[i].classList.remove("weak");
            }
         }
         if(_remove_layer.classList.contains("disabled") && _layer.length > 1){
            _remove_layer.classList.remove("disabled");
            _remove_combo.classList.add("disabled");
         }
         if(!_remove_combo.classList.contains("disabled")){
            _remove_combo.classList.add("disabled");
         }
         editingLayer = true;
      }else{ // comboの場合
         const i = [].slice.call(_combo).indexOf(target.closest(".combo"));
         _left_combo[i].classList.add("editing");
         _right_combo[i].classList.add("editing");
         _combo_hint[i].classList.add("editing");
         for(let i=0; i<_key.length; i++){
            if(document.querySelector(".editing .l"+_key[i].id.slice(1)+".combo_pos")){
               _key[i].classList.remove("weak");
            }else{
               _key[i].classList.add("weak");
            }
         }
         if(!_remove_layer.classList.contains("disabled")){
            _remove_layer.classList.add("disabled");
         }
         if(_remove_combo.classList.contains("disabled")){
            _remove_combo.classList.remove("disabled");
            _remove_layer.classList.add("disabled");
         }
         editingLayer = false;
      }
   }

   function updateLayerCodes(layerCount){
      const _dolc = document.getElementsByClassName("dolc"); // code elements that depend on layer count
      while(_dolc.length){
         _dolc[0].removeEventListener("click", codeClick);
         _dolc[0].remove();
      }
      let codes_mo, codes_to, codes_tog, codes_sl;
      codes_mo = codes_to = codes_tog = codes_sl = "";
      for(let i=1; i<=layerCount; ++i){
         codes_mo += '<div class="code dolc" data-names=`{"mo'+ i +'"}`><p class="lay">L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;mo ' + i + '</span>enable layer ' + i + ' while pressing</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
         codes_to += '<div class="code dolc" data-names=`{"to'+ i +'"}`><p>To<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;to ' + i + '</span>enable layer ' + i + ' and disables others except the default layer</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
         codes_tog += '<div class="code dolc" data-names=`{"tog'+ i +'"}`><p>Toggle<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;tog ' + i + '</span>enable/disable layer ' + i + '</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
         codes_sl += '<div class="code dolc" data-names=`{"sl'+ i +'"}`><p>Sticky<br>L' + i + '</p><div class="hint w l a m i"><p><span class="mono">&amp;sl ' + i + '</span>apply layer ' + i + ' to next keypress</p><div><img src="img/windows.svg"><img src="img/macos.svg"><img src="img/linux.svg"><img src="img/ios.svg"><img src="img/android.svg"></div></div></div>';
      }
      const temp = document.createElement("div");
      const temp2 = document.createElement("div");
      document.getElementById("after_tog").before(temp);
      document.getElementById("after_sl").before(temp2);
      temp.outerHTML = codes_mo + codes_to + codes_tog;
      temp2.outerHTML = codes_sl;
      for(let i=0; i<_dolc.length; i++){
         _dolc[i].addEventListener("click", codeClick);
      }
   }

   function moveComboHint(){
      const _hint = document.querySelector(".hint.editing");
      const _pos = document.querySelectorAll(".editing .combo_pos");
      let x = 0;
      let y = 0
      for(let i=0; i<_pos.length; i++){
         const box = _pos[i].getBoundingClientRect();
         x += box.left + box.right;
         y += box.top + box.bottom;
      }
      _hint.style.left = (x / _pos.length * .5) + "px";
      _hint.style.bottom = "calc(100% - " + (y / _pos.length * .5) + "px + 1.5rem)";
   }

   function helpClick(){
      alert("開発中：使い方説明が出る。キーコード→キーとクリックすると割り当てられる。kpキー→mod/moキーとクリックするとmt/ltキーを作れる。mod→（mod→）→kpキーとクリックすると修飾されたキーを作れる。みたいなことを書く。");
   }

   function confClick(){
      alert("開発中：設定画面が出る。mt/ltキー、コンボなどのフレーヴァーやパラメータが設定できる。");
   }

   function saveClick(){
      let t = '// キーに入力を割り当てる\n// 視覚的に編集できるツールは https://o24.works/fish/editor から\n\n\n// 定義を呼んでくる\n#include <behaviors.dtsi>\n#include <dt-bindings/zmk/keys.h>\n#include <dt-bindings/zmk/mouse.h>\n#include <dt-bindings/zmk/bt.h>\n#include <dt-bindings/zmk/outputs.h>\n\n\n// 複合キーの挙動を調整できる\n\n&mt {\n    flavor = "tap-preferred";\n    tapping-term-ms = <200>;\n    quick-tap-ms = <200>;\n};\n\n&lt {\n    flavor = "balanced";\n    tapping-term-ms = <200>;\n    quick-tap-ms = <200>;\n};\n\n&sk {\n    release-after-ms = <1000>;\n};\n\n&sl {\n    release-after-ms = <1000>;\n};\n\n\n/ {\n    // 独自の入力を定義できる（上級者向け）\n\n    behaviors {\n    };\n\n    macros {\n    };\n\n\n    // 複数キーの同時押しに特別の入力を設定できる\n    // キー番号早見表：\n    //       0  1  2  3     4  5  6  7\n    // 8  9 10 11 12 13    14 15 16 17 18 19\n    //   20 21 22 23          24 25 26 27\n    //            28 29    30 31\n\n    combos {\n        compatible = "zmk,combos";\n        timeout-ms = <100>;';
      for(let i=0; i<_combo.length; i++){
         show(_combo[i]);
         let pos = "";
         for(let ki=0; ki<32; ki++){
            if(document.querySelector(".editing .l"+ki).classList.contains("combo_pos")){
               pos += ki + " ";
            }
         }
         t += "\n\n        combo_" + _combo[i].firstChild.value + " {\n            key-positions = <" + pos.trim() + ">;\n            bindings = <&" + document.querySelector(".hint.editing .mono").innerHTML.substring(5) + ">;\n        };";
      }
      t += '\n    };\n    \n\n    // キーを割り当てる\n    // 型（&...）は https://zmk.dev/docs/behaviors/... を参照\n    // キーコードは https://zmk.dev/docs/codes/... を参照\n\n    keymap {\n        compatible = "zmk,keymap";';
      for(let i=0; i<_layer.length; i++){
         show(_layer[i]);
         t += "\n\n        layer_" + _layer[i].firstChild.value + " {\n            bindings = <\n                        ";
         let debt = 0;
         for(let ki=0; ki<32; ki++){
            const code = document.querySelector(".editing .l"+ki+" .mono").innerHTML.substring(5);
            let room = 11;
            if(ki == 3 || ki == 13 || ki == 29) room = 19;
            if(ki == 23) room = 43;
            t += "&" + code + " ".repeat(Math.max(1, room - debt - code.length));
            debt = Math.max(0, debt + code.length + 1 - room);
            switch(ki){
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
      _save.firstChild.href = window.URL.createObjectURL(new Blob([t], {type: 'text/plain'}));
      _save.firstChild.click();
      console.log(t);
   }

   async function loadInputChange(e){
      let file = e.currentTarget.files[0];
      if (!file) return;
      let tx = await fetchAsText(file);
      while(tx.includes("//")){ // コメントを削除
         let start = tx.indexOf("//");
         let end = tx.indexOf("\n", start);
         tx = tx.substring(0, start) + (end == -1 ? "" : tx.substring(end));
      }
      let t = tx.replace(/\s+/g, ""); // スペースを削除
      let s = t.lastIndexOf(";", t.indexOf("{", t.indexOf("keymap{")+7)) + 1;
      for(let i=0; i<999; i++){ // レイヤー
         if(i > 0) addLayer();
         const name = t.substring(s, t.indexOf("{", s));
         _layer[i].firstChild.value = name.substring(0, 6)=="layer_" ? name.substring(6) : name ;
         let ks = t.indexOf("&", s) + 1;
         let ke = t.indexOf("&", ks);
         for(let ki=0; ki<32; ki++){ // キー
            const _legend = document.querySelector(".editing .l" + ki);
            const code = t.substring(ks, ke);
            loadKey(code, _legend);
            ks = ke + 1;
            ke = (ki != 30) ? t.indexOf("&", ks) : t.indexOf(">", ks);
         }
         s = t.indexOf("};", s) + 2;
         if(t.charAt(s) == "}") break;
      }
      if(t.includes("combos{")){ // コンボ
         s = t.indexOf("combos{") + 7;
         sx = tx.indexOf("combos");
         for(let i=0; i<999; i++){
            let ss = t.indexOf("{", s);
            if(t.indexOf("}", s) < ss || ss == -1) break; // １個もなくても大丈夫
            addCombo();
            const name = t.substring(t.lastIndexOf(";", ss) + 1, ss);
            _combo[i].firstChild.value = name.substring(0, 6)=="combo_" ? name.substring(6) : name ;
            // bindings
            const bs = t.indexOf("<", (t.indexOf("bindings", ss)))+2;
            const code = t.substring(bs, t.indexOf(">", bs));
            const _temp = document.createElement("div");
            _temp.innerHTML = _code[0].innerHTML;
            loadKey(code, _temp);
            _temp.querySelector(".hint").classList.add("editing");
            document.querySelector("#combo_hints .hint.editing").outerHTML = _temp.querySelector(".hint").outerHTML;
            _temp.querySelector(".hint").remove();
            // key-positions
            document.querySelector(".editing .l11").classList.remove("combo_pos");
            document.querySelector(".editing .l16").classList.remove("combo_pos");
            const ps = tx.indexOf("<", (tx.indexOf("key-positions", sx)))+1;
            const pos = tx.substring(ps, tx.indexOf(">", ps)).trim().split(" ");
            for(let i=0; i<pos.length; i++){
               const _legend = document.querySelector(".editing .l"+pos[i]);
               _legend.classList.add("combo_pos");
               _legend.innerHTML = _temp.innerHTML;
            }
            _temp.remove();
            moveComboHint();
            s = t.indexOf("};", ss) + 2;
            sx = tx.indexOf("}", sx);
         }
      }
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

   function loadKey(code, _legend){
      if(code.substring(0,2) == "mt"){
         let holdP, holdCode, _tap;
         if(code.substring(2,7)=="LSHFT" || code.substring(2,8)=="LSHIFT" || code.substring(2,12)=="LEFT_SHIFT"){
            holdP = "Shift";
            holdCode = "LSHFT";
         }else if(code.substring(2,7)=="RSHFT" || code.substring(2,8)=="RSHIFT" || code.substring(2,13)=="RIGHT_SHIFT"){
            holdP = "RShift";
            holdCode = "RSHFT";
         }else if(code.substring(2,7)=="LCTRL" || code.substring(2,14)=="LEFT_CONTROL"){
            holdP = "Ctrl";
            holdCode = "LCTRL";
         }else if(code.substring(2,7)=="RCTRL" || code.substring(2,15)=="RIGHT_CONTROL"){
            holdP = "RCtrl";
            holdCode = "RCTRL";
         }else if(code.substring(2,6)=="LALT" || code.substring(2,10)=="LEFT_ALT"){
            holdP = '<span class="os w l a">Alt</span><span class="os m i">Opt</span>';
            holdCode = "LALT";
         }else if(code.substring(2,6)=="RALT" || code.substring(2,11)=="RIGHT_ALT"){
            holdP = 'R<span class="os w l a">Alt</span><span class="os m i">Opt</span>';
            holdCode = "RALT";
         }else if(code.substring(2,6)=="LGUI" || code.substring(2,6)=="LWIN" || code.substring(2,6)=="LCMD" || code.substring(2,7)=="LMETA" || code.substring(2,10)=="LEFT_GUI" || code.substring(2,10)=="LEFT_WIN" || code.substring(2,11)=="LEFT_META" || code.substring(2,14)=="LEFT_COMMAND"){
            holdP = '<span class="os w">Win</span><span class="os l a">GUI</span><span class="os m i">Cmd</span>';
            holdCode = "LGUI";
         }else if(code.substring(2,6)=="RGUI" || code.substring(2,6)=="RWIN" || code.substring(2,6)=="RCMD" || code.substring(2,7)=="RMETA" || code.substring(2,11)=="RIGHT_GUI" || code.substring(2,11)=="RIGHT_WIN" || code.substring(2,12)=="RIGHT_META" || code.substring(2,15)=="RIGHT_COMMAND"){
            holdP = 'R<span class="os w">Win</span><span class="os l a">GUI</span><span class="os m i">Cmd</span>';
            holdCode = "RGUI";
         }
         const tapCode = "kp" + code.substring(holdCode.length + 2);
         for(let ci=0; ci<_code.length; ci++){
            const names = _code[ci].dataset.names.split(" ");
            for(let ni=0; ni<names.length; ni++){
               if(names[ni] == tapCode){
                  _tap = _code[ci];
                  makeHoldTap(holdP, holdCode, _tap, _legend);
                  return;
               }
            }
         }
      }else if(code.substring(0,2) == "lt"){
         const holdCode = code.substring(2,code.search(/[A-Z]/));
         const tapCode = "kp" + code.substring(code.search(/[A-Z]/));
         let _tap;
         for(let ci=0; ci<_code.length; ci++){
            const names = _code[ci].dataset.names.split(" ");
            for(let ni=0; ni<names.length; ni++){
               if(names[ni] == tapCode){
                  _tap = _code[ci];
                  makeHoldTap("L"+holdCode, holdCode, _tap, _legend);
                  return;
               }
            }
         }
      }else if(code.includes("(")){
         _legend.innerHTML = '<p>'+code+'</p><div class="hint"><p><span class="mono">&amp;'+code+'</span>unlisted keycode</p></div>';
      }else{
         for(let ci=0; ci<_code.length; ci++){
            const names = _code[ci].dataset.names.split(" ");
            for(let ni=0; ni<names.length; ni++){
               if(names[ni] == code){
                  _legend.innerHTML = _code[ci].innerHTML;
                  return;
               }
            }
         }
         _legend.innerHTML = '<p>'+code+'</p><div class="hint"><p><span class="mono">&amp;'+code+'</span>unlisted keycode</p></div>';
      }
   }
});