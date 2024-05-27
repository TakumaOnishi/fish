window.addEventListener('DOMContentLoaded', () => {

   const _ham = document.getElementById("ham");

   _ham.addEventListener('click', function(){
      _ham.classList.toggle("show");
   });
});