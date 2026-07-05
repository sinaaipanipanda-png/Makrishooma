document.addEventListener("DOMContentLoaded",()=>{

const startBtn=document.getElementById("startGame");
const aboutBtn=document.getElementById("aboutBtn");
const settingBtn=document.getElementById("settingBtn");

if(startBtn){

startBtn.addEventListener("click",()=>{

startBtn.disabled=true;
startBtn.innerHTML="⏳ در حال ورود...";

setTimeout(()=>{

window.location.href="login-makrishooma.html";

},700);

});

}

if(aboutBtn){

aboutBtn.addEventListener("click",()=>{

alert(`🌍 جنگ جهانی ماکریشوما

نسخه: 1.0

سازنده: سینا

ویژگی‌ها:
• بازی آنلاین
• انتخاب کشور
• خرید سلاح
• موشک، بمب و بمب اتم
• گفت‌وگوی صوتی
• وبکم
• حالت تماشاگر
• بازگشت به بازی`);

});

}

if(settingBtn){

settingBtn.addEventListener("click",()=>{

alert("⚙️ تنظیمات در نسخه‌های بعدی اضافه خواهد شد.");

});

}

});
