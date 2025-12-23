chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProfileData") {
    try {
      // Name
      const nameEl = document.querySelector("h1");
      const name = nameEl ? nameEl.innerText.trim() : "Name not found";

      // Headline
      const headlineEl = document.querySelector(".text-body-medium.break-words");
      const headline = headlineEl ? headlineEl.innerText.trim() : "";

      // Location
      const locationEl = document.querySelector(
        ".pb2 .text-body-small.inline.t-black--light.break-words"
      );
      const location = locationEl ? locationEl.innerText.trim() : "";

      // Skills (check multiple selectors)
      let skills = Array.from(
        document.querySelectorAll(".pv-skill-category-entity__name-text")
      ).map((el) => el.innerText.trim());

      if (skills.length === 0) {
        skills = Array.from(
          document.querySelectorAll('[data-view-name=\"profile-skills\"] span')
        ).map((el) => el.innerText.trim());
      }

      // Contact Info
      let contactInfo = "Not available";
      const contactBtn = document.querySelector("a[href*='contact-info']");

      if (contactBtn) {
        contactBtn.click();
        setTimeout(() => {
          const modal = document.querySelectorAll(
            ".pv-contact-info__contact-type"
          );
          if (modal.length > 0) {
            contactInfo = Array.from(modal)
              .map((el) => el.innerText.trim())
              .join("\\n");
          }

          sendResponse({
            name,
            headline,
            location,
            skills,
            contactInfo,
          });
        }, 2000);

        return true; // async response
      } else {
        sendResponse({
          name,
          headline,
          location,
          skills,
          contactInfo,
        });
      }
    } catch (err) {
      sendResponse({ error: err.message });
    }

    return true;
  }
});
