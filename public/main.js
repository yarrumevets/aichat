const sendButton = document.getElementById("sendbutton");
const inputField = document.getElementById("chatinput");
const chatLog = document.getElementById("chatlog");

const createChatLog = (username, message) => {
  const newLog = document.createElement("p");
  const logName = document.createElement("span");
  const logMessage = document.createElement("span");
  const msgCost = document.createElement("span");
  newLog.classList.add("log");
  logName.classList.add("logname");
  logMessage.classList.add("logmessage");
  msgCost.classList.add("msgcost");
  logName.innerHTML = username;
  logMessage.innerHTML = message;
  newLog.append(msgCost);
  newLog.append(logName);
  newLog.append(logMessage);
  chatLog.append(newLog);
  return msgCost;
};

const calcCost = (tokens, type) => {
  const costs = {
    prompt: 0.0000015, // 0.0015 / 1000,
    completion: 0.000002, // 0.002 / 1000,
  };
  return tokens * costs[type];
};

async function sendMessage(message) {
  const myMsgCost = createChatLog("You", message);
  const messageData = {
    message,
  };
  const response = await fetch("./api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  }).catch((err) => console.error("Error: ", err));
  const jsonResponse = await response.json();
  const chatGPTMsgCost = createChatLog("ChatGPT", jsonResponse.response);
  const promptCost = calcCost(jsonResponse.usage.prompt_tokens, "prompt");
  const completionCost = calcCost(
    jsonResponse.usage.completion_tokens,
    "completion"
  );
  myMsgCost.innerHTML = `$${promptCost.toFixed(7)}`;
  chatGPTMsgCost.innerHTML = `$${completionCost.toFixed(7)}`;
}

const doSend = () => {
  const message = inputField.value;
  if (!message) return;
  inputField.value = "";
  inputField.focus();
  sendMessage(message);
};

inputField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    doSend();
  }
});

sendButton.onclick = () => {
  doSend();
};
