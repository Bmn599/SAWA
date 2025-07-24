// Backend endpoint for AI responses
const BACKEND_URL = "https://e191d09cb490.ngrok-free.app/chat";

// Conversation history sent with every request
let history = [];

/**
 * Send a message to the backend and return the AI reply.
 * @param {string} userText
 */
async function generateReply(userText) {
  const payload = { message: userText, history };

  // Debug log: Check payload structure before sending
  console.log(
    "Payload sent to backend:",
    payload,
    "message type:",
    typeof payload.message,
    "history is array:",
    Array.isArray(payload.history)
  );

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
    // Show backend error detail if available
    const msg = data.error || data.detail || `HTTP ${response.status}`;
    console.error("Backend error detail:", data.detail || msg);
    throw new Error(msg);
  }

  if (data.reply) {
    history.push({ user: userText, ai: data.reply });
    return data.reply;
  }
  throw new Error("No reply field in response");
}

// Expose for other scripts (e.g., UI handlers)
window.generateReply = generateReply;

/* ----------------------- UI LOGIC ----------------------- */

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatForm = document.getElementById('chatForm');

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSend.addEventListener('click', sendMessage);
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatSend.disabled = true;
  chatInput.disabled = true;

  const userDiv = addMessage(message, 'user');
  appendTimestamp(userDiv);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  const botDiv = addMessage('', 'bot');
  botDiv.classList.add('loading');

  try {
    const aiResponse = await window.generateReply(message);
    botDiv.classList.remove('loading');
    await typeWriter(botDiv.querySelector('.message-text'), aiResponse);
    appendTimestamp(botDiv);
  } catch (err) {
    console.error('Error generating response:', err);
    botDiv.classList.remove('loading');
    botDiv.querySelector('.message-text').textContent =
      `Error: ${err.message || 'Unable to get response'}`;
    appendTimestamp(botDiv);
  } finally {
    chatSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.innerHTML = `<div class="message-text">${text}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function appendTimestamp(el) {
  const span = document.createElement('span');
  span.className = 'timestamp';
  span.textContent = new Date().toLocaleTimeString();
  el.appendChild(span);
}

function typeWriter(el, text, delay = 20) {
  return new Promise(resolve => {
    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(type, delay);
      } else {
        resolve();
      }
    }
    type();
  });
}
