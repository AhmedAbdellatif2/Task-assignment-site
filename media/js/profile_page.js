const user = JSON.parse(sessionStorage.getItem("currentUser")) || null;
console.log(user);
if (!user) {
  window.location.href = "login.html";
} else {
  document.getElementById("username").textContent = user.username;
  document.getElementById("user-role").textContent = `Role: ${user.role}`;
  document.getElementById("user-email").textContent = `Email: ${user.email}`;
}
