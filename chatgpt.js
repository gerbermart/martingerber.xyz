const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

const openai = new OpenAI("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");

async function generateResponse(prompt) {
  const completions = await openai.complete({
    engine: "davinci",
    prompt: prompt,
    maxTokens: 150,
    n: 1,
    stop: ["\n"],
    temperature: 0.7,
  });
  const message = completions.choices[0].text.trim();
  return message;
}

function appendMessageToChatLog(message, sender) {
  const messageNode = document.createElement("div");
  messageNode.classList.add("chat-message");
  messageNode.classList.add(sender === "user" ? "user-message" : "bot-message");
  messageNode.innerText = message;
  chatLog.appendChild(messageNode);
}

async function handleUserInput() {
  const userInput = chatInput.value.trim();

  if (userInput !== "") {
    appendMessageToChatLog(userInput, "user");

    const response = await generateResponse(userInput);
    appendMessageToChatLog(response, "bot");

    chatInput.value = "";
  }
}

sendBtn.addEventListener("click", handleUserInput);
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleUserInput();
  }
});

// Initial message from bot
(async () => {
  const response = await generateResponse("hello");
  appendMessageToChatLog(response, "bot");
})();
