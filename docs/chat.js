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
    const aiResponse = await window.generateAIResponse(message);
    botDiv.classList.remove('loading');
    botDiv.querySelector('.message-text').textContent = aiResponse;
    appendTimestamp(botDiv);
  } catch (err) {
    console.error('Error generating response:', err);
    botDiv.classList.remove('loading');
    botDiv.querySelector('.message-text').textContent = "I'm here to listen and support you. Could you tell me more about what's on your mind?";
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
