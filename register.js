$(function () {
  $(".btn").click(function () {
    $(".form-signin").toggleClass("form-signin-left");
    $(".form-signup").toggleClass("form-signup-left");
    $(".frame").toggleClass("frame-long");
    $(".signup-inactive").toggleClass("signup-active");
    $(".signin-active").toggleClass("signin-inactive");
    $(".forgot").toggleClass("forgot-left");
    $(this).removeClass("idle").addClass("active");
  });
});

$(function () {
  $(".btn-signup").click(function () {
    $(".nav").toggleClass("nav-up");
    $(".form-signup-left").toggleClass("form-signup-down");
    $(".success").toggleClass("success-left");
    $(".frame").toggleClass("frame-short");
  });
});

$(function () {
  $(".btn-signin").click(function () {
    $(".btn-animate").toggleClass("btn-animate-grow");
    $(".welcome").toggleClass("welcome-left");
    $(".cover-photo").toggleClass("cover-photo-down");
    $(".frame").toggleClass("frame-short");
    $(".profile-photo").toggleClass("profile-photo-down");
    $(".btn-goback").toggleClass("btn-goback-up");
    $(".forgot").toggleClass("forgot-fade");
  });
});


const registerForm = document.getElementById("form-singup");
console.log(registerForm);

registerForm.addEventListener('submit', (event) =>{
  event.preventDefault();
  const { login, password, passRepaet } = registerForm;
  if (password.value !== passRepaet.value) {
    return alert('Паролі не співпадають');
  }
  const user = JSON.stringify({
    login: login.value,
    password: password.value
  });
  console.log(user);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/register');
  xhr.send(user);
  xhr.onload = () => alert(xhr.response);
});

const loginForm = document.getElementById("form-signin");

loginForm.addEventListener('submit', (event) =>{
  event.preventDefault();
  const { login, password} = loginForm;
  const user = JSON.stringify({
    login: login.value,
    password: password.value
  });
  console.log(user);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/login');
  xhr.send(user);
  xhr.onload = () =>{
     if(xhr.status === 200){
    const token = xhr.response;
    document.cookie = `token=${token}`;
    window.location.assign('/');
  }else
  {
    return alert(xhr.response);
  }
}

});