const SetVideo = document.getElementById('popup_setvideo');
$("#videoImg").on("click",function(){
  SetVideo.style.display = 'block';
});

$("#join-trigger").on("click",function(){
  SetVideo.style.display = 'none';
});

$("#popup_close_setvideo").on("click",function(){
  SetVideo.style.display = 'none';
});