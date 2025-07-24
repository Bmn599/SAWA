const BACKEND_URL = "http://195.201.124.49:8000/chat";
let history = [];

async function generateReply(userText) {
  const payload = { message: userText, history };
  console.log("Sending request:", payload);

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Invalid JSON from backend", err);
    throw new Error("Invalid response format");
  }

  console.log("Backend response:", data);

  if (!response.ok || data.error) {
    const msg = data.error || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (data.reply) {
    history.push({ user: userText, ai: data.reply });
    return data.reply;
  }

  throw new Error("No reply field in response");
}

window.generateReply = generateReply;
