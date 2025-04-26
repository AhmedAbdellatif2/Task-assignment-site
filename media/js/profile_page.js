const user = JSON.parse(localStorage.getItem("currentUser"));

if (!user) {
  window.location.href = "login.html";
} else {
  document.getElementById("username").textContent = user.name;
  document.getElementById("user-role").textContent = `Role: ${user.role}`;
  document.getElementById("user-email").textContent = `Email: ${user.email}`;
}
