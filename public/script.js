document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signup-btn");
    const loginBtn = document.getElementById("login-btn");
  
    if (signupBtn) {
      signupBtn.addEventListener("click", signup);
    }
  
    if (loginBtn) {
      loginBtn.addEventListener("click", login);
    }
  });


  async function signup() {
    try {
      const name = document.getElementById("name-signup").value;
      const email = document.getElementById("email-signup").value;
      const password = document.getElementById("password-signup").value;
  
      const response = await axios.post("http://localhost:3000/signup", {
        name,
        email,
        password,
      });
      document.getElementById("email-signup").value = "";
      document.getElementById("password-signup").value = "";
      alert(response.data.message);
      setTimeout(()=>{
        window.location.href = "./login.html";
      },1000);
    } catch (err) {
      console.error("Signing error:", err);
      alert("An error occurred during signup");
    }
  }

async function login() {
    console.log("Login clicked");
    try {
      const email = document.getElementById("email-login").value;
      const password = document.getElementById("password-login").value;
  
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      document.getElementById("email-login").value = "";
      document.getElementById("password-login").value = "";
      localStorage.setItem('token', response.data.token);
      alert(response.data.message);
      setTimeout(()=>{
        window.location.href = "./todos.html";
      },1000);
    } catch (error) {
      console.error(`Login Error ${error}`);
    }
  }
