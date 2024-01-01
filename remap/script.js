// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener('DOMContentLoaded', () => { // 読み込みを待って処理を始める

   const _s10 = document.getElementById("s10"); // HTML要素を取得する

   _s10.addEventListener('click', function(){
      console.log(_s10.getAttribute('fill'));
      _s10.setAttribute('fill', '#ff0000');
   });
});