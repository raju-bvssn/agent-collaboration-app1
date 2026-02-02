const agentForm = document.getElementById("agentForm");
const agentStatus = document.getElementById("agentStatus");
const listenBtn = document.getElementById("listenBtn");
const stopBtn = document.getElementById("stopBtn");
const conversationLog = document.getElementById("conversationLog");
const textForm = document.getElementById("textForm");
const textInput = document.getElementById("textInput");

const state = {
  agentName: "Agent",
  topic: "",
  persona: "curious analyst",
  isListening: false,
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
}

const updateStatus = (message, isActive = false) => {
  agentStatus.querySelector("span:last-child").textContent = message;
  const dot = agentStatus.querySelector(".dot");
  dot.classList.toggle("active", isActive);
};

const addMessage = (speaker, text) => {
  const message = document.createElement("div");
  message.className = "message";
  message.innerHTML = `<strong>${speaker}</strong><p>${text}</p>`;
  conversationLog.appendChild(message);
  conversationLog.scrollTop = conversationLog.scrollHeight;
};

const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

const speak = (text) => {
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  updateStatus(`${state.agentName} is speaking`, true);

  utterance.onend = () => {
    updateStatus(`${state.agentName} is listening`, state.isListening);
  };

  window.speechSynthesis.speak(utterance);
};

const generateOpinion = (question) => {
  const { topic, persona, agentName } = state;
  const topicLine = topic ? ` on ${topic}` : "";

  const perspective = {
    "optimistic strategist": "I see momentum building, and I would invest in practical pilots now.",
    "curious analyst": "I think the evidence points to a few promising paths worth testing next.",
    "calm skeptic": "I remain cautiously optimistic, but I would watch for tradeoffs and blind spots.",
    "empathetic storyteller": "I feel the human impact here is crucial, and I would center real stories.",
  }[persona];

  return `${agentName} here. Thanks for asking about "${question}"${topicLine}. ${perspective} If you want, ask a follow-up or challenge my view.`;
};

const handleQuestion = (question) => {
  if (!question.trim()) return;
  addMessage("You", question);
  const response = generateOpinion(question);
  addMessage(state.agentName, response);
  speak(response);
};

const startListening = () => {
  if (!recognition) {
    updateStatus("Voice input not supported in this browser.");
    return;
  }

  stopSpeaking();
  state.isListening = true;
  updateStatus(`${state.agentName} is listening`, true);
  recognition.start();
};

const stopListening = () => {
  if (recognition) {
    recognition.stop();
  }
  state.isListening = false;
  updateStatus("Agent idle");
};

agentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("agentName").value.trim();
  const topic = document.getElementById("topic").value.trim();
  const persona = document.getElementById("persona").value;

  state.agentName = name || "Agent";
  state.topic = topic;
  state.persona = persona;

  addMessage(
    "System",
    `${state.agentName} created. Topic: ${state.topic}. Persona: ${state.persona}.`
  );
  updateStatus(`${state.agentName} is ready`);
});

listenBtn.addEventListener("click", () => {
  startListening();
});

stopBtn.addEventListener("click", () => {
  stopSpeaking();
  stopListening();
});

textForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = textInput.value;
  textInput.value = "";
  handleQuestion(text);
});

if (recognition) {
  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    state.isListening = false;
    updateStatus(`${state.agentName} is thinking`);
    handleQuestion(transcript);
  });

  recognition.addEventListener("end", () => {
    state.isListening = false;
    updateStatus("Agent idle");
  });

  recognition.addEventListener("error", (event) => {
    state.isListening = false;
    updateStatus(`Voice input error: ${event.error}`);
  });
}

updateStatus("Agent idle");
