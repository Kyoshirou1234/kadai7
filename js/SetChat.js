import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5rktFQW3Z4oZQk2KMNMJAhFbQw6vN2Oc",
  authDomain: "tech-27-328c0.firebaseapp.com",
  projectId: "tech-27-328c0",
  storageBucket: "tech-27-328c0.appspot.com",
  messagingSenderId: "761360534979",
  appId: "1:761360534979:web:f929d0905b59b9084c4176"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // RealtimeDatabase使うよ
const dbRef = ref(db,"Tech-27"); // RealtimeDatabase”chat“を使うよ　chat/memo1など階層を設定することも可能

const popupWrapper = document.getElementById('popup_wrapper');
$(document).ready( function(){
  popupWrapper.style.display = 'block';
});

var username = "";
$("#save").on("click", function(){
username = $("#name").val()
if(username === ""){
alert("名前を入力してください。")
}
else{
popupWrapper.style.display = 'none';
AddMessage();
}

});

//送信処理
$("#send").on("click",function(){
const ymd = new Date();
const y = ymd.getFullYear();
const m = ymd.getMonth()+1;
const d = ymd.getDate();

const msg = {
	uname: username,
	text:  $("#text").val(),
	date:  y+"/"+m+"/"+d
};


if(msg.text === ""){
  alert("メッセージを入力してください")
  return;
}

const newPostRef = push(dbRef); //UniqeIDを発行
set(newPostRef, msg);           //set(ID名, 値);
});

function AddMessage(){
onChildAdded(dbRef, function(data){
const msg = data.val(); //object変数で受け取る
const key = data.key;   //このデータのUniqeIDを取得

let h = '<div class = "box-left" id = "' + data.key + '">';
if(msg.uname === username){h = '<div class = "box-right" id = "' + data.key + '">';}

h += '<div><p class = "info", id = "' + key + '_date">'+msg.date+"　　送信者 "+msg.uname+ '</p><div>';

if(msg.uname === username){
  if(msg.text.length > 40){h += '<div class = "Me40">';}
  else{h += '<div class = "Me">';}
}

else{
  if(msg.text.length > 40){h += '<div class = "You40">';}
	else{h += '<div class = "You">';}
}
	

h += '<span class = "message" contentEditable = "ture" id = "' + key + '_update">'+msg.text+'</span>';
h += "</div>"

if(msg.uname === username){
  h += '<button class = "remove" data-key = "'+key+'">削除</button>';
}
h += '<br>'
h += '</div>';

  $("#roomMain").append(h);
});
}


$("#roomMain").on("click", ".remove", function(){
  const key = $(this).attr("data-key");
  const remove_item = ref(db,"Tech-27/"+key);
  remove(remove_item);
});

onChildRemoved(dbRef, function(data)  {
$("#" + data.key).remove();
});