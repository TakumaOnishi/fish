window.addEventListener('DOMContentLoaded', () => {
   const _log = document.getElementById("log");
   //const _outdex = document.getElementById("outdex");
   let focus = false;

   document.addEventListener("keydown", (e) => {
      /*if(!focus){
         _outdex.classList.add("hidden");
         focus = true;
      }*/
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

   document.addEventListener("mousemove", () => {
      /*if(focus){
         _outdex.classList.remove("hidden");
         focus = false;
      }*/
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