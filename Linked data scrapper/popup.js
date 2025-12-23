function sendToGoogleSheet(profile, sheetUrl) {
  fetch(sheetUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  }).then(() => {
    console.log("Data sent to Google Sheet");
  }).catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");

  function extractAndSend(sheetUrl) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getProfileData" },
        (response) => {
          if (chrome.runtime.lastError) {
            resultDiv.innerText =
              "Error: " + chrome.runtime.lastError.message;
            return;
          }

          if (response && !response.error) {
            resultDiv.innerHTML = `
              <h2>Profile Information Viewer</h2>
              <p><strong>Name:</strong> ${response.name}</p>
              <p><strong>Headline:</strong> ${response.headline}</p>
              <p><strong>Contact Info:</strong><br>${response.contactInfo.replace(/\n/g, "<br>")}</p>
            `;

            // Send to selected sheet
            sendToGoogleSheet(response, sheetUrl);
          } else {
            resultDiv.innerText = "Error: " + (response?.error || "No data found");
          }
        }
      );
    });
  }

  // Button 1 → Sheet 1
  document.getElementById("extractBtn1").addEventListener("click", () => {
    extractAndSend("https://script.google.com/macros/s/AKfycbyMWmSLlRHHFBSuVIaSd2YP1IO0Z_gZ30QaCZ2brkHVo4VX9FSOsgR5h77Zcv3nCYc/exec");
  });

  // Button 2 → Sheet 2
  document.getElementById("extractBtn2").addEventListener("click", () => {
    extractAndSend("https://script.google.com/macros/s/AKfycbzDp-hYdlIxP7OaJ0PjRULgrcPcKfQif_2TJzy3npIqv-oonjlH5KyjnDEzPh9KLL-haQ/exec");
  });
});
