// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener('DOMContentLoaded', () => { // 読み込みを待って処理を始める

   const _select_os = document.getElementById("select_os"); // HTML要素を取得する
   const _code = document.getElementsByClassName("code");
   const _span = document.getElementsByTagName("span");

   _select_os.addEventListener('change', updateOS);

   updateOS();

   function updateOS(){
      let s = _select_os.value;
      if(s != ""){
         for (i=0; i<_code.length; i++){
            if (_code[i].classList.contains(s)){
               _code[i].style.display = "flex";
            }else{
               _code[i].style.display = "none";
            }
         }
         for(i=0; i<_span.length; i++){ // OSごとにキーの表示や説明を替える
            if(_span[i].classList.contains(s)){
               _span[i].style.display = "flex";
            }else{
               _span[i].style.display = "none";
            }
         }
      }else{ // compatible with "any" のとき
         for(i=0; i<_code.length; i++){
            _code[i].style.display = "flex";
         }
         for(i=0; i<_span.length; i++){
            if(_span[i].classList.contains("l")){ // anyの時の表示はlinuxに合わせる
               _span[i].style.display = "flex";
            }else{
               _span[i].style.display = "none";
            }
         }
      }
   }
});