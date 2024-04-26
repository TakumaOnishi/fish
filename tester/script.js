window.addEventListener('DOMContentLoaded', () => {

   const _ham = document.getElementById("ham");
   const _log = document.getElementById("log");

   _ham.addEventListener('click', function(){
      _ham.classList.toggle("show");
   });

   document.addEventListener("keydown", (e) => {
      let code = e.code;
      if(e.code.substring(0,3)=="Key") code = e.code.substring(3);
      if(e.code.substring(0,5)=="Digit") code = e.code.substring(5);
      _log.innerHTML = code + " ●<br>" + overflow(_log.innerHTML);
   });

   document.addEventListener("keyup", (e) => {
      let code = e.code;
      if(e.code.substring(0,3)=="Key") code = e.code.substring(3);
      if(e.code.substring(0,5)=="Digit") code = e.code.substring(5);
      _log.innerHTML = code + " ○<br>" + overflow(_log.innerHTML);
   });

   document.addEventListener("mousedown", (e) => {
      let code = e.button;
      _log.innerHTML = "MouseButton" + code + " ●<br>" + overflow(_log.innerHTML);
   });

   document.addEventListener("mouseup", (e) => {
      let code = e.button;
      _log.innerHTML = "MouseButton" + code + " ○<br>" + overflow(_log.innerHTML);
   });

   function overflow(text){
      if(text.length < 999) return text;
      return text.substring(0, 999);
   }
})