/**
 * Personal Assistant Mode JavaScript
 * Handles chat interface, voice input/output, and assistant interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ELEMENT REFERENCES =====
    const miniSidebar = document.getElementById('miniSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const voiceToggleBtn = document.getElementById('voiceToggleBtn');
    const botSpeaking = document.getElementById('botSpeaking');
    const userListening = document.getElementById('userListening');
    const quickSuggestions = document.getElementById('quickSuggestions');
    const clearChatBtn = document.getElementById('clearChatBtn');
    
    // Modal elements
    const languageModal = document.getElementById('languageModal');
    const historyModal = document.getElementById('historyModal');
    const favoritesModal = document.getElementById('favoritesModal');
    
    // ===== STATE VARIABLES =====
    let isListening = false;
    let isSpeaking = false;
    let recognition = null;
    let speechSynthesis = window.speechSynthesis;
    let currentLanguage = 'en';
    let conversationHistory = [];
    let favoriteMessages = [];
    let messageIdCounter = 0;
    
    // ===== SIDEBAR FUNCTIONALITY =====
    
    /**
     * Toggle mini sidebar expanded state
     */
    function toggleSidebar() {
        miniSidebar.classList.toggle('expanded');
        
        // Save state to localStorage
        const isExpanded = miniSidebar.classList.contains('expanded');
        localStorage.setItem('sidebarExpanded', isExpanded);
    }
    
    /**
     * Toggle mobile sidebar
     */
    function toggleMobileSidebar() {
        miniSidebar.classList.toggle('mobile-open');
    }
    
    /**
     * Initialize sidebar state from localStorage
     */
    function initializeSidebarState() {
        const isExpanded = localStorage.getItem('sidebarExpanded') === 'true';
        if (isExpanded) {
            miniSidebar.classList.add('expanded');
        }
    }
    
    // Event listeners for sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInsideSidebar = miniSidebar.contains(event.target);
            const isClickOnMenuBtn = mobileMenuBtn && mobileMenuBtn.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnMenuBtn && miniSidebar.classList.contains('mobile-open')) {
                miniSidebar.classList.remove('mobile-open');
            }
        }
    });
    
    // ===== CHAT FUNCTIONALITY =====
    
    /**
     * Create a new message element
     * @param {string} content - The message content
     * @param {string} type - 'user' or 'bot'
     * @param {number} messageId - Unique message ID
     * @returns {HTMLElement} The message element
     */
    function createMessageElement(content, type, messageId) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.setAttribute('data-message-id', messageId);
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Handle different content types
        if (typeof content === 'string') {
            const paragraphs = content.split('\n').filter(p => p.trim());
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                bubble.appendChild(p);
            });
        }
        
        messageContent.appendChild(bubble);
        
        // Add actions for bot messages
        if (type === 'bot') {
            const actions = document.createElement('div');
            actions.className = 'message-actions';
            
            const replayBtn = document.createElement('button');
            replayBtn.className = 'action-btn replay-btn';
            replayBtn.title = 'Replay audio';
            replayBtn.innerHTML = '<span class="action-icon">🔊</span>';
            replayBtn.addEventListener('click', () => speakMessage(content));
            
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'action-btn favorite-btn';
            favoriteBtn.title = 'Add to favorites';
            favoriteBtn.innerHTML = '<span class="action-icon">⭐</span>';
            favoriteBtn.addEventListener('click', () => toggleFavorite(messageId, content, favoriteBtn));
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'message-time';
            timeSpan.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            actions.appendChild(replayBtn);
            actions.appendChild(favoriteBtn);
            actions.appendChild(timeSpan);
            messageContent.appendChild(actions);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        return messageDiv;
    }
    
    /**
     * Add a message to the chat
     * @param {string} content - The message content
     * @param {string} type - 'user' or 'bot'
     */
    function addMessage(content, type) {
        const messageId = ++messageIdCounter;
        const messageElement = createMessageElement(content, type, messageId);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to conversation history
        const messageData = {
            id: messageId,
            content: content,
            type: type,
            timestamp: new Date().toISOString()
        };
        conversationHistory.push(messageData);
        
        // Save to localStorage
        saveConversationHistory();
        
        return messageId;
    }
    
    /**
     * Send a user message
     * @param {string} message - The message to send
     */
    function sendMessage(message) {
        if (!message.trim()) return;
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        adjustTextareaHeight();
        
        // Hide suggestions
        hideSuggestions();
        
        // Simulate bot response (replace with actual AI integration)
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            const messageId = addMessage(botResponse, 'bot');
            
            // Speak the response if voice is enabled
            if (voiceToggleBtn.classList.contains('active')) {
                speakMessage(botResponse);
            }
        }, 1000 + Math.random() * 2000); // Random delay for realism
    }
    
    /**
     * Generate a bot response (placeholder - replace with AI integration)
     * @param {string} userMessage - The user's message
     * @returns {string} The bot's response
     */
    function generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Cultural etiquette responses
        if (message.includes('japanese') && message.includes('etiquette')) {
            return "In Japanese business culture, proper etiquette is crucial. Key points include:\n\n• Bow when greeting (depth shows respect level)\n• Exchange business cards with both hands\n• Remove shoes when entering homes\n• Avoid pointing with fingers\n• Be punctual - arriving early shows respect\n\nWould you like me to elaborate on any of these customs?";
        }
        
        if (message.includes('african') && message.includes('greeting')) {
            return "African greeting customs vary widely across the continent, but here are some common traditions:\n\n• Handshakes are common, often lasting longer than Western customs\n• In many cultures, greeting elders first shows respect\n• Some cultures use specific hand gestures or clapping\n• Eye contact rules vary - in some cultures, direct eye contact with elders is avoided\n• Community greetings often involve asking about family and health\n\nWhich specific African culture would you like to learn more about?";
        }
        
        if (message.includes('india') && message.includes('travel')) {
            return "Preparing for travel to India involves several cultural considerations:\n\n• Learn basic Hindi phrases like 'Namaste' (hello/goodbye)\n• Dress modestly, especially when visiting religious sites\n• Remove shoes before entering homes and temples\n• Use your right hand for eating and greeting\n• Be prepared for diverse regional customs\n• Respect religious practices and festivals\n• Try local cuisine but be cautious with street food initially\n\nWould you like specific advice for any particular region of India?";
        }
        
        // General responses
        const responses = [
            "That's an interesting cultural question! Let me help you understand this better. Cultural practices often have deep historical roots and serve important social functions in their communities.",
            
            "I'd be happy to share insights about that cultural topic. Understanding different traditions helps us appreciate the rich diversity of human experience across the globe.",
            
            "Great question about cultural practices! Each tradition has evolved over centuries and reflects the values, beliefs, and experiences of its people. Let me explain more about this.",
            
            "Cultural understanding is so important in our interconnected world. This particular aspect you're asking about has fascinating origins and continues to play a significant role today.",
            
            "Thank you for your curiosity about different cultures! This is exactly the kind of cross-cultural learning that helps build bridges between communities worldwide."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Clear the chat conversation
     */
    function clearChat() {
        // Keep only the welcome message
        const welcomeMessage = chatMessages.querySelector('.message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage);
        }
        
        // Clear history
        conversationHistory = [];
        saveConversationHistory();
        
        // Show suggestions again
        showSuggestions();
        
        showNotification('Chat cleared', 'info');
    }
    
    // ===== VOICE FUNCTIONALITY =====
    
    /**
     * Initialize speech recognition
     */
    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = getLanguageCode(currentLanguage);
            
            recognition.onstart = function() {
                isListening = true;
                userListening.classList.add('active');
                voiceInputBtn.classList.add('listening');
                console.log('Voice recognition started');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                console.log('Voice input received:', transcript);
                
                // Send the voice message
                sendMessage(transcript);
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                showNotification('Voice recognition error. Please try again.', 'error');
                stopListening();
            };
            
            recognition.onend = function() {
                stopListening();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }
    
    /**
     * Start voice input
     */
    function startListening() {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                showNotification('Could not start voice input. Please try again.', 'error');
            }
        } else if (!recognition) {
            showNotification('Voice input not supported in this browser.', 'warning');
        }
    }
    
    /**
     * Stop voice input
     */
    function stopListening() {
        if (recognition && isListening) {
            recognition.stop();
        }
        isListening = false;
        userListening.classList.remove('active');
        voiceInputBtn.classList.remove('listening');
    }
    
    /**
     * Speak a message using text-to-speech
     * @param {string} text - The text to speak
     */
    function speakMessage(text) {
        if (!speechSynthesis) {
            showNotification('Text-to-speech not supported in this browser.', 'warning');
            return;
        }
        
        // Stop any current speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLanguageCode(currentLanguage);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = function() {
            isSpeaking = true;
            botSpeaking.classList.add('active');
        };
        
        utterance.onend = function() {
            isSpeaking = false;
            botSpeaking.classList.remove('active');
        };
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event.error);
            isSpeaking = false;
            botSpeaking.classList.remove('active');
        };
        
        speechSynthesis.speak(utterance);
    }
    
    /**
     * Toggle voice output on/off
     */
    function toggleVoiceOutput() {
        voiceToggleBtn.classList.toggle('active');
        const isActive = voiceToggleBtn.classList.contains('active');
        
        if (isActive) {
            showNotification('Voice output enabled', 'success');
        } else {
            showNotification('Voice output disabled', 'info');
            // Stop any current speech
            if (speechSynthesis) {
                speechSynthesis.cancel();
            }
            botSpeaking.classList.remove('active');
        }
        
        // Save preference
        localStorage.setItem('voiceOutputEnabled', isActive);
    }
    
    /**
     * Get language code for speech APIs
     * @param {string} lang - Language identifier
     * @returns {string} Language code
     */
    function getLanguageCode(lang) {
        const codes = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'zh': 'zh-CN',
            'ja': 'ja-JP'
        };
        return codes[lang] || 'en-US';
    }
    
    // ===== INPUT HANDLING =====
    
    /**
     * Adjust textarea height based on content
     */
    function adjustTextareaHeight() {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    }
    
    /**
     * Handle input events
     */
    function handleInput() {
        adjustTextareaHeight();
        
        // Enable/disable send button
        const hasContent = chatInput.value.trim().length > 0;
        sendBtn.disabled = !hasContent;
        
        // Hide suggestions when typing
        if (hasContent) {
            hideSuggestions();
        } else {
            showSuggestions();
        }
    }
    
    /**
     * Handle key press events
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    }
    
    // ===== SUGGESTIONS FUNCTIONALITY =====
    
    /**
     * Show quick suggestions
     */
    function showSuggestions() {
        if (conversationHistory.length <= 1) { // Only welcome message
            quickSuggestions.style.display = 'block';
        }
    }
    
    /**
     * Hide quick suggestions
     */
    function hideSuggestions() {
        quickSuggestions.style.display = 'none';
    }
    
    /**
     * Handle suggestion click
     * @param {string} suggestion - The suggestion text
     */
    function handleSuggestionClick(suggestion) {
        chatInput.value = suggestion;
        adjustTextareaHeight();
        sendMessage(suggestion);
    }
    
    // ===== FAVORITES FUNCTIONALITY =====
    
    /**
     * Toggle favorite status of a message
     * @param {number} messageId - The message ID
     * @param {string} content - The message content
     * @param {HTMLElement} button - The favorite button
     */
    function toggleFavorite(messageId, content, button) {
        const existingIndex = favoriteMessages.findIndex(fav => fav.id === messageId);
        
        if (existingIndex >= 0) {
            // Remove from favorites
            favoriteMessages.splice(existingIndex, 1);
            button.classList.remove('favorited');
            showNotification('Removed from favorites', 'info');
        } else {
            // Add to favorites
            favoriteMessages.push({
                id: messageId,
                content: content,
                timestamp: new Date().toISOString()
            });
            button.classList.add('favorited');
            showNotification('Added to favorites', 'success');
        }
        
        // Save to localStorage
        saveFavorites();
    }
    
    // ===== MODAL FUNCTIONALITY =====
    
    /**
     * Open a modal
     * @param {HTMLElement} modal - The modal element
     */
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close a modal
     * @param {HTMLElement} modal - The modal element
     */
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * Handle language selection
     * @param {string} langCode - The language code
     */
    function selectLanguage(langCode) {
        currentLanguage = langCode;
        
        // Update recognition language
        if (recognition) {
            recognition.lang = getLanguageCode(langCode);
        }
        
        // Update UI
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${langCode}"]`).classList.add('active');
        
        // Save preference
        localStorage.setItem('selectedLanguage', langCode);
        
        showNotification(`Language changed to ${getLanguageName(langCode)}`, 'success');
        closeModal(languageModal);
    }
    
    /**
     * Get language name
     * @param {string} code - Language code
     * @returns {string} Language name
     */
    function getLanguageName(code) {
        const names = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'zh': '中文',
            'ja': '日本語'
        };
        return names[code] || 'English';
    }
    
    // ===== DATA PERSISTENCE =====
    
    /**
     * Save conversation history to localStorage
     */
    function saveConversationHistory() {
        try {
            localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }
    
    /**
     * Load conversation history from localStorage
     */
    function loadConversationHistory() {
        try {
            const saved = localStorage.getItem('conversationHistory');
            if (saved) {
                conversationHistory = JSON.parse(saved);
                // Restore message ID counter
                messageIdCounter = Math.max(...conversationHistory.map(msg => msg.id), 0);
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
            conversationHistory = [];
        }
    }
    
    /**
     * Save favorites to localStorage
     */
    function saveFavorites() {
        try {
            localStorage.setItem('favoriteMessages', JSON.stringify(favoriteMessages));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }
    
    /**
     * Load favorites from localStorage
     */
    function loadFavorites() {
        try {
            const saved = localStorage.getItem('favoriteMessages');
            if (saved) {
                favoriteMessages = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            favoriteMessages = [];
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Show notification to user
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#27AE60',
            error: '#C0392B',
            warning: '#F39C12',
            info: '#E67E22'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Handle window resize events
     */
    function handleResize() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 768) {
            miniSidebar.classList.remove('mobile-open');
        }
        
        // Adjust chat messages scroll
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    // Chat input events
    if (chatInput) {
        chatInput.addEventListener('input', handleInput);
        chatInput.addEventListener('keypress', handleKeyPress);
    }
    
    // Send button
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        });
    }
    
    // Voice input button
    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', () => {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });
    }
    
    // Voice toggle button
    if (voiceToggleBtn) {
        voiceToggleBtn.addEventListener('click', toggleVoiceOutput);
    }
    
    // Clear chat button
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }
    
    // Suggestion buttons
    if (quickSuggestions) {
        quickSuggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const suggestion = e.target.getAttribute('data-suggestion');
                handleSuggestionClick(suggestion);
            }
        });
    }
    
    // Tool buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.tool-btn')) {
            const tool = e.target.closest('.tool-btn').getAttribute('data-tool');
            switch (tool) {
                case 'history':
                    openModal(historyModal);
                    break;
                case 'favorites':
                    openModal(favoritesModal);
                    break;
                case 'language':
                    openModal(languageModal);
                    break;
            }
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Language selection
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const langCode = e.target.closest('.language-btn').getAttribute('data-lang');
            selectLanguage(langCode);
        });
    });
    
    // Window resize
    window.addEventListener('resize', handleResize);
    
    // ===== KEYBOARD SHORTCUTS =====
    
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter: Send message
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
        
        // Ctrl/Cmd + Space: Voice input
        if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
            e.preventDefault();
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
        
        // Escape: Close modals or stop voice
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            } else if (isListening) {
                stopListening();
            }
        }
        
        // Ctrl/Cmd + K: Clear chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearChat();
        }
    });
    
    // ===== INITIALIZATION =====
    
    /**
     * Initialize the application
     */
    function initializeApp() {
        console.log('Initializing Personal Assistant Mode...');
        
        // Initialize sidebar state
        initializeSidebarState();
        
        // Load saved data
        loadConversationHistory();
        loadFavorites();
        
        // Initialize speech recognition
        initializeSpeechRecognition();
        
        // Load saved preferences
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        selectLanguage(savedLanguage);
        
        const voiceEnabled = localStorage.getItem('voiceOutputEnabled') === 'true';
        if (voiceEnabled) {
            voiceToggleBtn.classList.add('active');
        }
        
        // Initialize input
        adjustTextareaHeight();
        handleInput();
        
        // Show initial suggestions
        showSuggestions();
        
        // Focus on input
        if (chatInput) {
            chatInput.focus();
        }
        
        // Show welcome notification
        setTimeout(() => {
            showNotification('Welcome to Personal Assistant Mode! Ask me anything about cultures and traditions.', 'success');
        }, 1000);
        
        console.log('Personal Assistant Mode initialized successfully');
    }
    
    // Start the application
    initializeApp();
    
    // ===== EXPORT FOR TESTING =====
    
    // Make functions available globally for testing (optional)
    window.AssistantMode = {
        sendMessage,
        toggleSidebar,
        startListening,
        stopListening,
        speakMessage,
        showNotification,
        clearChat
    };
});

