// contact-extractor.js - Enhanced contact information extraction
(function() {
    'use strict';

    // Function to try clicking the contact info button and extract details
    function tryExtractContactInfo() {
        return new Promise((resolve) => {
            // Look for "Contact info" button/link
            const contactButtons = [
                'a[data-control-name="contact_see_more"]',
                'button[aria-label*="contact"]',
                'a[href*="#contact-info"]',
                '.pv-top-card-v2-ctas a[data-control-name="contact_see_more"]',
                'button[data-control-name="contact_see_more"]'
            ];

            let contactButton = null;
            for (const selector of contactButtons) {
                contactButton = document.querySelector(selector);
                if (contactButton) break;
            }

            if (contactButton && contactButton.style.display !== 'none') {
                console.log('Found contact info button, attempting to click...');
                
                // Create a click event
                contactButton.click();
                
                // Wait for modal to load
                setTimeout(() => {
                    const contactInfo = extractFromContactModal();
                    resolve(contactInfo);
                }, 2000);
            } else {
                console.log('No contact info button found');
                resolve({});
            }
        });
    }

    // Extract information from the contact info modal
    function extractFromContactModal() {
        const contactData = {};

        // Look for contact info modal
        const modalSelectors = [
            '.artdeco-modal',
            '[role="dialog"]',
            '.pv-contact-info'
        ];

        let modal = null;
        for (const selector of modalSelectors) {
            modal = document.querySelector(selector);
            if (modal && modal.style.display !== 'none') break;
        }

        if (modal) {
            console.log('Contact modal found, extracting info...');

            // Extract email
            const emailElements = modal.querySelectorAll('a[href^="mailto:"], .pv-contact-info__contact-type');
            emailElements.forEach(el => {
                const text = el.textContent || el.href;
                if (text && text.includes('@') && !contactData.email) {
                    contactData.email = text.replace('mailto:', '').trim();
                }
            });

            // Extract phone
            const phoneElements = modal.querySelectorAll('a[href^="tel:"], .pv-contact-info__contact-type');
            phoneElements.forEach(el => {
                const text = el.textContent || el.href;
                if (text && text.match(/[\+\d\(\)\-\s]{7,}/) && !contactData.phone) {
                    contactData.phone = text.replace('tel:', '').trim();
                }
            });

            // Extract websites
            const websiteElements = modal.querySelectorAll('a[href^="http"]:not([href*="linkedin.com"])');
            const websites = [];
            websiteElements.forEach(el => {
                if (el.href && !el.href.includes('linkedin.com')) {
                    websites.push(el.href);
                }
            });
            if (websites.length > 0) {
                contactData.websites = websites;
            }

            // Close the modal
            const closeButton = modal.querySelector('[data-test-modal-close-btn], .artdeco-modal__dismiss, [aria-label*="Dismiss"]');
            if (closeButton) {
                setTimeout(() => closeButton.click(), 500);
            }
        }

        return contactData;
    }

    // Enhanced contact extraction function
    async function getAdvancedContactInfo() {
        const contactInfo = {
            linkedinUrl: window.location.href,
            websites: [],
            socialLinks: {},
            email: '',
            phone: '',
            companyDomain: ''
        };

        // Try to extract from contact modal
        const modalInfo = await tryExtractContactInfo();
        Object.assign(contactInfo, modalInfo);

        // Extract from profile content
        const profileContent = document.querySelector('main, .profile-detail');
        if (profileContent) {
            // Find website links in about section or anywhere in profile
            const links = profileContent.querySelectorAll('a[href^="http"]:not([href*="linkedin.com"])');
            links.forEach(link => {
                const url = link.href;
                if (!contactInfo.websites.includes(url)) {
                    contactInfo.websites.push(url);
                }

                // Categorize social media links
                if (url.includes('twitter.com')) contactInfo.socialLinks.twitter = url;
                else if (url.includes('github.com')) contactInfo.socialLinks.github = url;
                else if (url.includes('instagram.com')) contactInfo.socialLinks.instagram = url;
                else if (url.includes('facebook.com')) contactInfo.socialLinks.facebook = url;
                else if (url.includes('youtube.com')) contactInfo.socialLinks.youtube = url;
                else if (url.includes('behance.net')) contactInfo.socialLinks.behance = url;
                else if (url.includes('dribbble.com')) contactInfo.socialLinks.dribbble = url;
            });
        }

        // Extract company domain from current job
        const currentJobElement = document.querySelector('.pv-text-details__left-panel h1 + div + div, .experience-section .pv-entity__summary-info:first-child');
        if (currentJobElement) {
            const companyText = currentJobElement.textContent;
            if (companyText) {
                const companyName = companyText.split(' at ')[1] || companyText.split(' • ')[0];
                if (companyName) {
                    const domain = companyName.toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .replace(/(inc|ltd|llc|corp|company|technologies|tech|solutions|group)$/g, '');
                    contactInfo.companyDomain = `${domain}.com`;
                }
            }
        }

        return contactInfo;
    }

    // Message listener for advanced contact extraction
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractAdvancedContact') {
            getAdvancedContactInfo().then(contactInfo => {
                sendResponse({ success: true, contactInfo: contactInfo });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open
        }
    });

})();