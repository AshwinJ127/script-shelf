chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PASTE_SNIPPET") {
    const activeElement = document.activeElement;
    const text = request.code;

    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const val = activeElement.value;
      
      activeElement.value = val.substring(0, start) + text + val.substring(end);
    } else if (activeElement.isContentEditable) {
      document.execCommand('insertText', false, text);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard! (Click a text box to paste directly)');
      });
    }
  }
});