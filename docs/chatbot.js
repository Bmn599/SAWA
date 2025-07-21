const BACKEND_URL = "http://195.201.124.49:8000/chat";
let history = [];

async function generateReply(userText) {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText, history }),
  });
  const data = await response.json();
  history.push({ user: userText, ai: data.reply });
  return data.reply;
}

window.generateReply = generateReply;
