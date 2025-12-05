const API_URL = import.meta.env.VITE_APP_URL;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-snippet",
    title: "Save to Script Shelf",
    contexts: ["selection"] 
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-snippet") {
    const selectedText = info.selectionText;
    
    const data = await chrome.storage.local.get("authToken");
    if (!data.authToken) {
      console.log("Please sign in via the extension icon first.");
      return;
    }

    const title = selectedText.substring(0, 20) + "...";

    try {
      const res = await fetch(`${API_URL}/api/snippets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": data.authToken
        },
        body: JSON.stringify({
          title: title,
          code: selectedText,
          language: "text", 
          folder_id: null
        })
      });

      if (res.ok) {
        console.log("Snippet saved!");
      } else {
        console.error("Failed to save snippet.");
      }
    } catch (err) {
      console.error(err);
    }
  }
});