console.log("login.js loaded");

function login() {
    const password = document.getElementById("password").value;

    // CHANGE THIS PASSWORD
    const CORRECT_PASSWORD = "Bestyarn@123";

    if (password === CORRECT_PASSWORD) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("Wrong password");
    }
}