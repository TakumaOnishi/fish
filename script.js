window.addEventListener('DOMContentLoaded', () => {

   const _otaku = document.getElementsByClassName("otaku");

   for(let i=0; i<_otaku.length; i++){
      _otaku[i].addEventListener('click', function(){
         _otaku[i].classList.toggle("show");
      });
   }
});