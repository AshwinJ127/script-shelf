const API_URL = import.meta.env.VITE_APP_URL;

const authView = document.getElementById("auth-view");
const mainView = document.getElementById("main-view");
const createView = document.getElementById("create-view");

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");
const snippetList = document.getElementById("snippet-list");

const newTitle = document.getElementById("new-title");
const newLang = document.getElementById("new-lang");
const newCode = document.getElementById("new-code");
const createError = document.getElementById("create-error");

let currentToken = null;

chrome.storage.local.get("authToken", (data) => {
  if (data.authToken) {
    currentToken = data.authToken;
    showMain();
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passInput.value;
  errorMsg.innerText = "";

  try {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      currentToken = data.token;
      chrome.storage.local.set({ authToken: data.token });
      showMain();
    } else {
      errorMsg.innerText = data.msg || "Login failed";
    }
  } catch (err) {
    errorMsg.innerText = "Network error";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  chrome.storage.local.remove("authToken");
  currentToken = null;
  authView.classList.remove("hidden");
  mainView.classList.add("hidden");
  createView.classList.add("hidden");
});

document.getElementById("new-btn").addEventListener("click", () => {
  mainView.classList.add("hidden");
  createView.classList.remove("hidden");
  createError.innerText = "";
  newTitle.value = "";
  newCode.value = "";
  newLang.value = "javascript";
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  createView.classList.add("hidden");
  mainView.classList.remove("hidden");
});

document.getElementById("save-btn").addEventListener("click", async () => {
  const title = newTitle.value;
  const code = newCode.value;
  const language = newLang.value;

  if (!title || !code) {
    createError.innerText = "Title and Code are required";
    return;
  }

  createError.innerText = "Saving...";

  try {
    const res = await fetch(`${API_URL}/api/snippets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": currentToken
      },
      body: JSON.stringify({ title, code, language, folder_id: null })
    });

    if (res.ok) {
      createView.classList.add("hidden");
      mainView.classList.remove("hidden");
      showMain();
    } else {
      const data = await res.json();
      createError.innerText = data.msg || "Failed to save";
    }
  } catch (err) {
    createError.innerText = "Network error";
  }
});

async function showMain() {
  authView.classList.add("hidden");
  createView.classList.add("hidden");
  mainView.classList.remove("hidden");
  
  try {
    const res = await fetch(`${API_URL}/api/snippets`, {
      headers: { "x-auth-token": currentToken }
    });
    const snippets = await res.json();
    renderSnippets(snippets);

    document.getElementById("search").addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = snippets.filter(s => s.title.toLowerCase().includes(term));
      renderSnippets(filtered);
    });

  } catch (err) {
    snippetList.innerText = "Failed to load snippets.";
  }
}

function renderSnippets(snippets) {
  snippetList.innerHTML = "";
  if (snippets.length === 0) {
    snippetList.innerText = "No snippets found.";
    return;
  }

  snippets.forEach(s => {
    const div = document.createElement("div");
    div.className = "snippet-item";
    div.innerHTML = `
      <div class="snippet-title">${s.title}</div>
      <div class="snippet-lang">${s.language}</div>
    `;
    
    div.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { 
          action: "PASTE_SNIPPET", 
          code: s.code 
        });
        window.close();
      }
    });

    snippetList.appendChild(div);
  });
}