// DOM Elements
const urlForm = document.getElementById('url-form');
const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const resultContainer = document.getElementById('result');
const shortUrlInput = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');
const copyMessage = document.getElementById('copy-message');
const statsContainer = document.getElementById('stats-container');
const originalUrlElement = document.getElementById('original-url');
const clickCountElement = document.getElementById('click-count');
const creationDateElement = document.getElementById('creation-date');

// API Base URL
const API_BASE_URL = window.location.origin;

// Event Listeners
urlForm.addEventListener('submit', handleFormSubmit);
copyBtn.addEventListener('click', handleCopyUrl);

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const originalUrl = urlInput.value.trim();

    if (!originalUrl) {
        showError('الرجاء إدخال رابط صحيح');
        return;
    }

    // Show loading state
    shortenBtn.textContent = 'جاري الاختصار...';
    shortenBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ originalUrl })
        });

        const data = await response.json();

        if (response.ok) {
            displayResult(data);
        } else {
            showError(data.error || 'حدث خطأ أثناء اختصار الرابط');
        }
    } catch (error) {
        showError('فشل الاتصال بالخادم. الرجاء المحاولة مرة أخرى');
        console.error('Error:', error);
    } finally {
        // Reset button state
        shortenBtn.textContent = 'اختصار الرابط';
        shortenBtn.disabled = false;
    }
}

// Display Result
function displayResult(data) {
    // Show result container
    resultContainer.classList.remove('hidden');

    // Set the short URL
    shortUrlInput.value = data.shortUrl;

    // Display stats
    displayStats(data);
}

// Display Stats
function displayStats(data) {
    statsContainer.classList.remove('hidden');

    originalUrlElement.textContent = data.originalUrl;
    clickCountElement.textContent = data.clicks || 0;

    // Format date
    const date = new Date(data.date);
    creationDateElement.textContent = date.toLocaleDateString('ar-SA');
}

// Copy URL Handler
async function handleCopyUrl() {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);

        // Show success message
        copyMessage.classList.remove('hidden');

        // Hide message after 3 seconds
        setTimeout(() => {
            copyMessage.classList.add('hidden');
        }, 3000);
    } catch (error) {
        showError('فشل نسخ الرابط');
        console.error('Error copying URL:', error);
    }
}

// Show Error Message
function showError(message) {
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    // Style the error element
    errorElement.style.backgroundColor = '#f8d7da';
    errorElement.style.color = '#721c24';
    errorElement.style.padding = '15px';
    errorElement.style.borderRadius = '5px';
    errorElement.style.marginTop = '15px';
    errorElement.style.textAlign = 'center';

    // Insert after form
    urlForm.insertAdjacentElement('afterend', errorElement);

    // Remove after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}
