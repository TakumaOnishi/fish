// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener('DOMContentLoaded', () => { // 読み込みを待って処理を始める

   const _select_os = document.getElementById("select_os"); // HTML要素を取得する
   const _code = document.getElementsByClassName("code");

   _select_os.addEventListener('change', function(){
      let s=_select_os.value;
      console.log(s);
      var len = _code.length;
      for (i=0; i<len; i++){
        if (s==""){
         _code[i].style.display = "flex";
        }
        else if (_code[i].classList.contains(s)){
         _code[i].style.display = "flex";
        }
        else {
         _code[i].style.display = "none";
        }
      }
   });

});