// JSの簡単な例（テキストをクリックすると文字色が白↔︎黒にトグルする）
window.addEventListener('DOMContentLoaded', () => { // 読み込みを待って処理を始める

   const _example = document.body; // HTML要素を取得する

   let textIsWhite = true; // 今のテキストの色をもつ変数

   _example.addEventListener('click', function(){
      textIsWhite = !textIsWhite; // trueならfalseに、falseならtrueにする
      updateTextColor(); // 使い回したい処理は関数にまとめる
   });

   function updateTextColor(){ // CSSの内容を書き換える
   }
});