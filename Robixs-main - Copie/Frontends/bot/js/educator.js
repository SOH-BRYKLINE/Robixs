/**
 * Educator Mode JavaScript
 * Handles sidebar navigation, voice input functionality, and page interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ELEMENT REFERENCES =====
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceModal = document.getElementById('voiceModal');
    const closeVoiceBtn = document.getElementById('closeVoiceBtn');
    
    // ===== STATE VARIABLES =====
    let isListening = false;
    let recognition = null;
    
    // ===== SIDEBAR FUNCTIONALITY =====
    
    /**
     * Toggle sidebar expanded state
     */
    function toggleSidebar() {
        sidebar.classList.toggle('expanded');
        
        // Save state to localStorage
        const isExpanded = sidebar.classList.contains('expanded');
        localStorage.setItem('sidebarExpanded', isExpanded);
    }
    
    /**
     * Toggle mobile sidebar
     */
    function toggleMobileSidebar() {
        sidebar.classList.toggle('mobile-open');
    }
    
    /**
     * Initialize sidebar state from localStorage
     */
    function initializeSidebarState() {
        const isExpanded = localStorage.getItem('sidebarExpanded') === 'true';
        if (isExpanded) {
            sidebar.classList.add('expanded');
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
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnMenuBtn = mobileMenuBtn && mobileMenuBtn.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnMenuBtn && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
    
    // ===== PAGE-SPECIFIC FUNCTIONALITY =====
    
    /**
     * Initialize page-specific features based on current page
     */
    function initializePageFeatures() {
        const currentPage = getCurrentPageName();
        
        switch (currentPage) {
            case 'languages':
                initializeLanguageTabs();
                break;
            case 'quizzes':
                // Quiz functionality is handled in the HTML file
                break;
            case 'settings':
                // Settings functionality is handled in the HTML file
                break;
        }
    }
    
    /**
     * Get current page name from URL
     * @returns {string} Current page name
     */
    function getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('.html', '') || 'dashboard';
    }
    
    /**
     * Initialize language tabs functionality
     */
    function initializeLanguageTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        // Initialize audio playback for phrases
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const phraseItem = this.closest('.phrase-item');
                const text = phraseItem.querySelector('.phrase-text').textContent;
                const romanized = phraseItem.querySelector('.phrase-romanized').textContent;
                
                // Use text-to-speech to play the phrase
                speakText(text + '. ' + romanized);
            });
        });
    }
    
    // ===== VOICE INPUT FUNCTIONALITY =====
    
    /**
     * Initialize speech recognition
     */
    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                isListening = true;
                if (voiceModal) {
                    voiceModal.style.display = 'flex';
                }
                console.log('Voice recognition started');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                console.log('Voice input received:', transcript);
                
                // Process the voice command
                processVoiceCommand(transcript);
                stopListening();
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
        if (voiceModal) {
            voiceModal.style.display = 'none';
        }
    }
    
    /**
     * Process voice commands
     * @param {string} command - The voice command to process
     */
    function processVoiceCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // Navigation commands
        if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
            window.location.href = 'dashboard.html';
        } else if (lowerCommand.includes('tribes') || lowerCommand.includes('ethnic')) {
            window.location.href = 'tribesAndEthnicGroups.html';
        } else if (lowerCommand.includes('timeline') || lowerCommand.includes('history')) {
            window.location.href = 'historicalTimelines.html';
        } else if (lowerCommand.includes('folklore') || lowerCommand.includes('myths')) {
            window.location.href = 'folkloreAndMyths.html';
        } else if (lowerCommand.includes('proverbs') || lowerCommand.includes('sayings')) {
            window.location.href = 'proverbs.html';
        } else if (lowerCommand.includes('language') || lowerCommand.includes('phrases')) {
            window.location.href = 'languages.html';
        } else if (lowerCommand.includes('quiz') || lowerCommand.includes('challenge')) {
            window.location.href = 'quizzes.html';
        } else if (lowerCommand.includes('settings')) {
            window.location.href = 'settings.html';
        } else if (lowerCommand.includes('assistant') || lowerCommand.includes('chat')) {
            window.location.href = 'assistant.html';
        } else {
            // General voice query - redirect to assistant mode
            localStorage.setItem('voiceQuery', command);
            window.location.href = 'assistant.html';
        }
    }
    
    /**
     * Speak text using text-to-speech
     * @param {string} text - The text to speak
     */
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        } else {
            showNotification('Text-to-speech not supported in this browser.', 'warning');
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    // Voice input button
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });
    }
    
    // Close voice modal
    if (closeVoiceBtn) {
        closeVoiceBtn.addEventListener('click', stopListening);
    }
    
    // Close voice modal when clicking outside
    if (voiceModal) {
        voiceModal.addEventListener('click', function(event) {
            if (event.target === voiceModal) {
                stopListening();
            }
        });
    }
    
    // Window resize handler
    window.addEventListener('resize', function() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
    
    // ===== KEYBOARD SHORTCUTS =====
    
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + B: Toggle sidebar
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
            event.preventDefault();
            toggleSidebar();
        }
        
        // Ctrl/Cmd + Space: Voice input
        if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
            event.preventDefault();
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
        
        // Escape: Close voice modal
        if (event.key === 'Escape' && isListening) {
            stopListening();
        }
        
        // Number keys for quick navigation (1-9)
        if (event.altKey && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const pageIndex = parseInt(event.key) - 1;
            const pages = [
                'dashboard.html',
                'tribesAndEthnicGroups.html',
                'historicalTimelines.html',
                'folkloreAndMyths.html',
                'proverbs.html',
                'languages.html',
                'quizzes.html',
                'settings.html',
                'assistant.html'
            ];
            
            if (pages[pageIndex]) {
                window.location.href = pages[pageIndex];
            }
        }
    });
    
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
            sidebar.classList.remove('mobile-open');
        }
    }
    
    // ===== INITIALIZATION =====
    
    /**
     * Initialize the application
     */
    function initializeApp() {
        console.log('Initializing Educator Mode...');
        
        // Initialize sidebar state
        initializeSidebarState();
        
        // Initialize speech recognition
        initializeSpeechRecognition();
        
        // Initialize page-specific features
        initializePageFeatures();
        
        // Check for voice query from localStorage (from voice command navigation)
        const voiceQuery = localStorage.getItem('voiceQuery');
        if (voiceQuery && getCurrentPageName() === 'assistant') {
            // Clear the stored query
            localStorage.removeItem('voiceQuery');
            // The assistant page will handle the query
        }
        
        console.log('Educator Mode initialized successfully');
    }
    
    // Start the application
    initializeApp();
    
    // ===== EXPORT FOR TESTING =====
    
    // Make functions available globally for testing (optional)
    window.EducatorMode = {
        toggleSidebar,
        startListening,
        stopListening,
        speakText,
        showNotification,
        processVoiceCommand
    };
});

