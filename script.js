window.addEventListener('DOMContentLoaded', () => {

   const _otaku = document.getElementsByClassName("otaku");
   const _ham = document.getElementById("ham");
   const _gallery = document.getElementById("gallery");
   const _g_img = document.getElementsByClassName("g_img");

   for (let i = 0; i < _otaku.length; i++) {
      _otaku[i].addEventListener('click', function () {
         _otaku[i].classList.toggle("show");
      });
   }

   _ham.addEventListener('click', function () {
      _ham.classList.toggle("show");
   });

   for (let i = 0; i < _g_img.length; i++) {
      _g_img[i].addEventListener('click', function () {
         _gallery.prepend(_gallery.removeChild(this));
      });
   }

});