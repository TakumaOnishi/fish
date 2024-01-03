// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener('DOMContentLoaded', () => { // 読み込みを待って処理を始める

   const _k10 = document.getElementById("k10"); // HTML要素を取得する

   _k10.addEventListener('click', function(){
      console.log(_k10.getAttribute('fill'));
      _k10.setAttribute('fill', '#ff0000');
   });
});