// Endpoint for the backend chat API
const BACKEND_URL = "http://195.201.124.49:8000/chat";

// Basic placeholder for chatbot functionality
async function sendMessage(message) {
  console.log('Sending message:', message);
  // Send the user's message to the backend and return the reply
  const resp = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await resp.json();
  return data.reply;
}
