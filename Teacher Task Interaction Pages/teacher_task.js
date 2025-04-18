let API_KEY =
  "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";
document.addEventListener("DOMContentLoaded", async () => {
  let messages = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "assistant",
      content: "Hello, how can I help you?",
    },
  ];
  let chat_toggle = document.getElementsByClassName("chat_toggle")[0];
  let chat_exit = document.getElementsByClassName("chat_exit")[0];
  let chat_bot = document.getElementsByClassName("chat_bot")[0];
  chat_toggle.addEventListener("click", function () {
    chat_toggle.classList.add("active");
    setTimeout(() => {
      chat_bot.classList.add("visible");
    }, 300);
  });

  chat_exit.addEventListener("click", () => {
    chat_bot.classList.remove("visible"); // start hiding the bot

    // After the bot has fully slid out, hide the toggle
    setTimeout(() => {
      chat_toggle.classList.remove("active");
    }, 300); // match the transition duration in CSS (300ms)
  });

  let chat_input = document.getElementById("chatbot_input");
  let chat_send = document.getElementById("chat_send");
  let chat_body = document.getElementsByClassName("chatbot-messages")[0];

  chat_send.addEventListener("click", async () => {
    let message = chat_input.value;
    if (message.trim() === "") return; // Ignore empty messages
    chat_input.value = ""; // Clear the input field
    chat_body.innerHTML += `<div class="message user-message">${message}</div>`;
    chat_body.scrollTop = chat_body.scrollHeight; // Scroll to the bottom
    chat_body.innerHTML += `
  <div class="message bot-message typing-dots">
    <span>.</span><span>.</span><span>.</span>
  </div>`;
    chat_body.scrollTop = chat_body.scrollHeight; // Scroll to the bottom
    messages.push({ role: "user", content: message });
    let resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "thudm/glm-4-32b:free",
        messages: messages,
      }),
    });
    let data = await resp.json();
    if (data.error) {
      console.error("Error:", data.error);
      chat_body.innerHTML += `<div class="message bot-message">Error: ${data.error}</div>`;
      return;
    }
    let message_out = data.choices[0].message.content;
    messages.push({ role: "assistant", content: message_out });
    chat_body.innerHTML = chat_body.innerHTML.replace(
      `<div class="message bot-message typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>`,
      `<div class="message bot-message">${message_out}</div>`
    );
  });
  document
    .getElementById("chatbot_input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Optional: prevent default form submission
        document.getElementById("chat_send").click();
      }
    });
});
