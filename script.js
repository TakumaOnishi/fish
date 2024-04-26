window.addEventListener('DOMContentLoaded', () => {

   const _otaku = document.getElementsByClassName("otaku");
   const _ham = document.getElementById("ham");

   for(let i=0; i<_otaku.length; i++){
      _otaku[i].addEventListener('click', function(){
         _otaku[i].classList.toggle("show");
      });
   }

   _ham.addEventListener('click', function(){
      _ham.classList.toggle("show");
   });
});