const chatContainer = document.getElementById("chat-container");
const chatOutput = document.getElementById("chat-output");
const chatInputBox = document.getElementById("chat-input-box");
const chatSendBtn = document.getElementById("chat-send-btn");

function sendChatMessage() {
  const userMessage = chatInputBox.value;
  chatInputBox.value = "";

  const botMessage = generateBotResponse(userMessage);

  const messageTemplate = `
    <div class="chat-message user-message">${userMessage}</div>
    <div class="chat-message bot-message">${botMessage}</div>
  `;
  chatOutput.insertAdjacentHTML("beforeend", messageTemplate);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
  // Call your Chat GPT API or library here to generate a response
  // based on the user's message, and return the response string.
  return "Hello, how can I help you?";
}

chatSendBtn.addEventListener("click", sendChatMessage);
