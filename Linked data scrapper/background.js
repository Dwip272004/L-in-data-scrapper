// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('LinkedIn Profile Extractor installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes('linkedin.com/in/')) {
        // Extension popup will open automatically
        console.log('LinkedIn profile page detected');
    } else {
        // Show notification for non-LinkedIn pages
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'LinkedIn Profile Extractor',
            message: 'Please navigate to a LinkedIn profile page to use this extension.'
        });
    }
});

// Listen for tab updates to detect LinkedIn profile navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com/in/')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Script might already be injected, ignore error
            console.log('Content script injection:', err.message);
        });
    }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'profileDataExtracted') {
        // Store the extracted data
        chrome.storage.local.set({ 
            linkedinProfileData: request.data,
            extractedAt: Date.now()
        });
        
        // Optionally update badge or notification
        chrome.action.setBadgeText({
            text: '✓',
            tabId: sender.tab.id
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: '#0077B5'
        });
        
        sendResponse({ success: true });
    }
    
    return true; // Keep message channel open
});