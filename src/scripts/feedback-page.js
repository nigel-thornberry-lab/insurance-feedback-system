// Professional Insurance Feedback System - Interactive Prototype
// Optimized for touch devices with comprehensive visual feedback

class FeedbackSystem {
    constructor() {
        this.currentRating = 0;
        this.selectedIssues = new Set();
        this.formData = {};
        this.isSubmitting = false;
        this.touchDevice = this.isTouchDevice();
        this.apiClient = new ApiClient();
        this.leadData = null;
        this.brokerData = null;
        this.startTime = Date.now();
        
        this.init();
    }

    async init() {
        // Initialize backend and load lead data from URL
        await this.initializeData();
        
        this.setupStarRating();
        this.setupStatusDropdown();
        this.setupIssueButtons();
        this.setupCommentField();
        this.setupFormValidation();
        this.setupSubmitButton();
        this.setupTouchOptimizations();
        this.setupAccessibility();
        this.loadSavedData();
        
        // Add professional loading animation
        this.addPageLoadAnimation();
        
        // Setup analytics tracking
        this.setupAnalyticsTracking();
    }

    setupAnalyticsTracking() {
        // Track page view
        this.trackEvent('page_view', {
            leadId: this.leadData?.leadId,
            brokerId: this.brokerData?.brokerId,
            leadScore: this.leadData?.score,
            timestamp: new Date().toISOString()
        });

        // Track user interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.star')) {
                this.trackEvent('star_rating_click', {
                    rating: e.target.dataset.rating,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Track form abandonment
        window.addEventListener('beforeunload', () => {
            if (this.currentRating === 0 && !this.isSubmitting) {
                this.trackEvent('form_abandon', {
                    timeOnPage: Date.now() - this.startTime,
                    rating: this.currentRating,
                    status: document.getElementById('leadStatus').value
                });
            }
        });
    }

    trackEvent(eventName, data) {
        console.log(`📊 Analytics Event: ${eventName}`, data);
        
        // Send analytics event to backend
        this.apiClient.trackEvent(eventName, {
            leadId: this.leadData?.external_id,
            brokerId: this.brokerData?.external_id,
            ...data
        });
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'system-error';
        errorDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            ${message}
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async initializeData() {
        try {
            console.log('🚀 Initializing feedback system...');
            
            // Parse URL parameters for lead data
            const urlParams = this.apiClient.parseURLParameters();
            console.log('📥 URL Parameters:', urlParams);
            
            // Load lead and broker data from PostgreSQL backend
            this.leadData = await this.apiClient.getLeadInfo(urlParams.leadId);
            this.brokerData = await this.apiClient.getBrokerInfo(urlParams.brokerId);
            
            // Update UI with real lead data
            this.updateLeadDisplay();
            this.updateHiddenFields(urlParams);
            
            console.log('✅ Data initialization complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize data:', error);
            this.showErrorMessage('Failed to load lead data. Using demo data.');
            this.loadDemoData();
        }
    }

    updateLeadDisplay() {
        if (!this.leadData) return;
        
        // Update lead name
        const leadNameElement = document.querySelector('.lead-name');
        if (leadNameElement) {
            leadNameElement.textContent = this.leadData.name;
        }
        
        // Update lead score
        const scoreElement = document.querySelector('.score-number');
        if (scoreElement) {
            scoreElement.textContent = this.leadData.score;
        }
        
        // Update received date
        const dateElement = document.querySelector('.meta-item span');
        if (dateElement) {
            const receivedDate = new Date(this.leadData.receivedDate);
            dateElement.textContent = `Received: ${receivedDate.toLocaleDateString('en-NZ')}`;
        }
        
        // Update score circle color based on score
        this.updateScoreCircleColor(this.leadData.score);
        
        console.log('🎯 UI updated with lead data:', this.leadData);
    }

    updateScoreCircleColor(score) {
        const scoreCircle = document.querySelector('.score-circle');
        if (!scoreCircle) return;
        
        // Remove existing color classes
        scoreCircle.classList.remove('score-high', 'score-medium', 'score-low');
        
        // Add appropriate color based on score
        if (score >= 80) {
            scoreCircle.classList.add('score-high');
            scoreCircle.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
        } else if (score >= 60) {
            scoreCircle.classList.add('score-medium');
            scoreCircle.style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
        } else {
            scoreCircle.classList.add('score-low');
            scoreCircle.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
        }
    }

    updateHiddenFields(urlParams) {
        // Update hidden form fields with real data
        const leadIdField = document.querySelector('input[name="leadId"]');
        if (leadIdField) {
            leadIdField.value = urlParams.leadId;
        }
        
        const brokerField = document.querySelector('input[name="brokerName"]');
        if (brokerField && this.brokerData) {
            brokerField.value = this.brokerData.name;
        }
        
        // Add additional hidden fields for comprehensive tracking
        this.addHiddenField('brokerId', urlParams.brokerId);
        this.addHiddenField('sessionId', this.apiClient.sessionId);
        this.addHiddenField('leadScore', this.leadData?.score);
        this.addHiddenField('leadType', this.leadData?.insuranceType);
        this.addHiddenField('formStartTime', this.startTime);
    }

    addHiddenField(name, value) {
        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = name;
        field.value = value || '';
        document.getElementById('feedbackForm').appendChild(field);
    }

    loadDemoData() {
        // Fallback demo data if URL parameters fail
        this.leadData = {
            leadId: 'DEMO-12345',
            name: 'Sarah Mitchell',
            score: 87,
            receivedDate: new Date().toISOString(),
            insuranceType: 'Life Insurance'
        };
        
        this.brokerData = {
            brokerId: 'demo_broker',
            name: 'John Smith',
            company: 'Demo Insurance Co'
        };
        
        this.updateLeadDisplay();
        this.updateHiddenFields({
            leadId: 'DEMO-12345',
            brokerId: 'demo_broker'
        });
    }

    isTouchDevice() {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    }

    // Enhanced Star Rating System
    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('selectedRating');
        const starContainer = document.querySelector('.star-rating');
        
        if (!stars.length) return;

        // Add dynamic rating description
        this.createRatingDescription();

        stars.forEach((star, index) => {
            const rating = parseInt(star.dataset.rating);
            
            // Touch-optimized event handlers
            if (this.touchDevice) {
                star.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
                star.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.selectRating(rating);
                }, { passive: false });
            } else {
                star.addEventListener('click', () => this.selectRating(rating));
                star.addEventListener('mouseenter', () => this.previewRating(rating));
                star.addEventListener('mouseleave', () => this.resetPreview());
            }

            // Keyboard support
            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectRating(rating);
                }
            });
        });

        // Number key shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '5' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.selectRating(parseInt(e.key));
            }
        });
    }

    handleTouchStart(e) {
        e.preventDefault();
        // Add touch feedback
        const star = e.currentTarget;
        star.style.transform = 'scale(0.95)';
        setTimeout(() => {
            star.style.transform = '';
        }, 150);
    }

    selectRating(rating) {
        this.currentRating = rating;
        this.updateStarDisplay(rating);
        document.getElementById('selectedRating').value = rating;
        
        // Professional haptic feedback
        this.triggerHapticFeedback();
        
        // Update rating description
        this.updateRatingDescription(rating);
        
        // Announce to screen readers
        this.announceRating(rating);
        
        // Auto-save
        this.autoSave();
        
        // Validate form
        this.validateForm();
    }

    previewRating(rating) {
        if (!this.touchDevice) {
            this.updateStarDisplay(rating, true);
        }
    }

    resetPreview() {
        if (!this.touchDevice) {
            this.updateStarDisplay(this.currentRating);
        }
    }

    updateStarDisplay(rating, isPreview = false) {
        const stars = document.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            const starRating = parseInt(star.dataset.rating);
            const svg = star.querySelector('svg');
            
            if (starRating <= rating) {
                star.classList.add('active');
                if (!isPreview) {
                    // Add stagger animation
                    setTimeout(() => {
                        star.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            star.style.transform = '';
                        }, 200);
                    }, index * 50);
                }
            } else {
                star.classList.remove('active');
            }
        });
    }

    createRatingDescription() {
        const container = document.querySelector('.rating-container');
        const description = document.createElement('div');
        description.className = 'rating-description';
        description.innerHTML = `
            <div class="rating-text">Select a rating to continue</div>
        `;
        container.appendChild(description);
    }

    updateRatingDescription(rating) {
        const descriptions = {
            1: 'Poor - Significant issues with lead quality',
            2: 'Fair - Below average, needs improvement', 
            3: 'Good - Average quality, meets basic standards',
            4: 'Great - Above average, good potential',
            5: 'Excellent - Outstanding lead quality'
        };
        
        const element = document.querySelector('.rating-text');
        if (element) {
            element.textContent = descriptions[rating];
            element.style.color = this.getRatingColor(rating);
        }
    }

    getRatingColor(rating) {
        const colors = {
            1: '#EF4444', 2: '#EF4444', 3: '#F59E0B', 4: '#84CC16', 5: '#22C55E'
        };
        return colors[rating] || '#64748B';
    }

    // Enhanced Status Dropdown
    setupStatusDropdown() {
        const dropdown = document.getElementById('leadStatus');
        if (!dropdown) return;

        // Add visual feedback for selection
        dropdown.addEventListener('change', (e) => {
            const value = e.target.value;
            
            // Add selection animation
            dropdown.style.transform = 'scale(1.02)';
            setTimeout(() => {
                dropdown.style.transform = '';
            }, 150);
            
            // Update styling based on status
            this.updateStatusStyling(dropdown, value);
            
            // Haptic feedback
            this.triggerHapticFeedback();
            
            // Auto-save and validate
            this.autoSave();
            this.validateForm();
        });

        // Enhanced focus/blur effects
        dropdown.addEventListener('focus', () => {
            dropdown.parentElement.classList.add('focused');
        });
        
        dropdown.addEventListener('blur', () => {
            dropdown.parentElement.classList.remove('focused');
        });
    }

    updateStatusStyling(dropdown, value) {
        // Remove existing status classes
        dropdown.classList.remove('status-new', 'status-progress', 'status-success', 'status-failed');
        
        // Add appropriate class based on status
        if (value === 'new' || value === 'contacted') {
            dropdown.classList.add('status-new');
        } else if (['booked', 'first-meeting', 'second-meeting', 'submitted'].includes(value)) {
            dropdown.classList.add('status-progress');
        } else if (value === 'issued') {
            dropdown.classList.add('status-success');
        } else if (value === 'failed') {
            dropdown.classList.add('status-failed');
        }
    }

    // Enhanced Issue Buttons
    setupIssueButtons() {
        const buttons = document.querySelectorAll('.issue-btn');
        const issuesInput = document.getElementById('selectedIssues');
        
        buttons.forEach(button => {
            const issue = button.dataset.issue;
            
            // Touch-optimized handlers
            if (this.touchDevice) {
                button.addEventListener('touchstart', this.handleButtonTouchStart.bind(this), { passive: false });
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.toggleIssue(button, issue);
                }, { passive: false });
            } else {
                button.addEventListener('click', () => this.toggleIssue(button, issue));
            }

            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleIssue(button, issue);
                }
            });
        });
    }

    handleButtonTouchStart(e) {
        e.preventDefault();
        const button = e.currentTarget;
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    toggleIssue(button, issue) {
        const isSelected = this.selectedIssues.has(issue);
        
        if (isSelected) {
            this.selectedIssues.delete(issue);
            button.classList.remove('selected');
            this.animateButtonDeselect(button);
        } else {
            this.selectedIssues.add(issue);
            button.classList.add('selected');
            this.animateButtonSelect(button);
        }
        
        // Update hidden input
        document.getElementById('selectedIssues').value = Array.from(this.selectedIssues).join(',');
        
        // Haptic feedback
        this.triggerHapticFeedback();
        
        // Auto-save
        this.autoSave();
    }

    animateButtonSelect(button) {
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    animateButtonDeselect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    // Enhanced Comment Field
    setupCommentField() {
        const textarea = document.getElementById('comments');
        const charCount = document.getElementById('charCount');
        
        if (!textarea || !charCount) return;

        // Real-time character counting with visual feedback
        textarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            const maxLength = 200;
            const percentage = (count / maxLength) * 100;
            
            charCount.textContent = count;
            
            // Color coding based on usage
            if (percentage > 90) {
                charCount.style.color = '#EF4444';
                charCount.style.fontWeight = '600';
            } else if (percentage > 75) {
                charCount.style.color = '#F59E0B';
                charCount.style.fontWeight = '500';
            } else {
                charCount.style.color = '#64748B';
                charCount.style.fontWeight = '500';
            }

            // Auto-save
            this.autoSave();
        });

        // Enhanced focus effects
        textarea.addEventListener('focus', () => {
            textarea.parentElement.classList.add('focused');
        });

        textarea.addEventListener('blur', () => {
            textarea.parentElement.classList.remove('focused');
        });
    }

    // Comprehensive Form Validation
    setupFormValidation() {
        const form = document.getElementById('feedbackForm');
        
        // Real-time validation
        form.addEventListener('input', () => {
            this.validateForm();
        });
        
        form.addEventListener('change', () => {
            this.validateForm();
        });
    }

    validateForm() {
        const errors = [];
        const dropdown = document.getElementById('leadStatus');
        
        // Clear existing error states
        this.clearErrorStates();
        
        // Validate required fields
        if (!this.currentRating) {
            errors.push({
                field: 'rating',
                message: 'Please rate the lead quality',
                element: document.querySelector('.star-rating')
            });
        }
        
        if (!dropdown.value) {
            errors.push({
                field: 'status',
                message: 'Please select the current lead status',
                element: dropdown
            });
        }
        
        // Update submit button state
        this.updateSubmitButton(errors.length === 0);
        
        // Show/hide errors
        if (errors.length > 0) {
            this.showValidationErrors(errors);
        }
        
        return errors.length === 0;
    }

    clearErrorStates() {
        document.querySelectorAll('.field-error').forEach(el => {
            el.classList.remove('field-error');
        });
        
        const existingError = document.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showValidationErrors(errors) {
        // Only show first error to avoid overwhelming user
        const error = errors[0];
        
        // Add error styling to field
        if (error.element) {
            error.element.classList.add('field-error');
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error';
            errorDiv.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ${error.message}
            `;
            
            // Insert error message
            const container = error.element.closest('section');
            if (container) {
                container.appendChild(errorDiv);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                }, 5000);
            }
        }
    }

    // Enhanced Submit Button
    setupSubmitButton() {
        const form = document.getElementById('feedbackForm');
        const submitBtn = document.querySelector('.submit-btn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.isSubmitting) return;
            
            if (!this.validateForm()) {
                this.showValidationErrors([]);
                return;
            }
            
            await this.submitFeedback();
        });
    }

    updateSubmitButton(isValid) {
        const submitBtn = document.querySelector('.submit-btn');
        
        if (isValid) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled');
            submitBtn.classList.add('ready');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
            submitBtn.classList.remove('ready');
        }
    }

    async submitFeedback() {
        const submitBtn = document.querySelector('.submit-btn');
        this.isSubmitting = true;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Haptic feedback
        this.triggerHapticFeedback('success');
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Simulate API call with realistic delay
            await this.simulateSubmission(formData);
            
            // Show success state
            this.showSubmissionSuccess();
            
        } catch (error) {
            // Show error state
            this.showSubmissionError(error);
        } finally {
            this.isSubmitting = false;
        }
    }

    collectFormData() {
        const formCompletionTime = Date.now() - this.startTime;
        
        return {
            leadId: document.querySelector('input[name="leadId"]').value,
            brokerId: document.querySelector('input[name="brokerId"]')?.value || 'unknown',
            brokerName: document.querySelector('input[name="brokerName"]').value,
            brokerEmail: this.brokerData?.email || '',
            rating: this.currentRating,
            status: document.getElementById('leadStatus').value,
            issues: Array.from(this.selectedIssues),
            comments: document.getElementById('comments').value.trim(),
            leadScore: this.leadData?.score,
            leadType: this.leadData?.insuranceType,
            formCompletionTime: Math.floor(formCompletionTime / 1000), // in seconds
            sessionId: this.apiClient.sessionId,
            touchDevice: this.touchDevice,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            retryCount: this.retryCount || 0,
            autosaveUsed: this.autosaveUsed || false
        };
    }

    async simulateSubmission(data) {
        // Submit feedback to PostgreSQL backend via API
        try {
            const result = await this.apiClient.submitFeedback(data);
            return result;
        } catch (error) {
            this.retryCount = (this.retryCount || 0) + 1;
            throw error;
        }
    }

    showSubmissionSuccess() {
        const submitBtn = document.querySelector('.submit-btn');
        
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Feedback Submitted Successfully
        `;
        
        // Clear saved draft
        localStorage.removeItem('feedbackDraft');
        
        // Show success message
        setTimeout(() => {
            this.showSuccessModal();
        }, 500);
    }

    showSubmissionError(error) {
        const submitBtn = document.querySelector('.submit-btn');
        
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('error');
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Submission Failed - Retry
        `;
        
        submitBtn.disabled = false;
        
        // Reset after 3 seconds
        setTimeout(() => {
            submitBtn.classList.remove('error');
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Submit Feedback
            `;
            this.updateSubmitButton(this.validateForm());
        }, 3000);
    }

    showSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="success-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3>Thank You!</h3>
                    <p>Your feedback has been submitted successfully and will help improve our lead quality.</p>
                    <button class="modal-close-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Close button
        modal.querySelector('.modal-close-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.querySelector('.modal-close-btn').click();
            }
        }, 5000);
    }

    // Touch Device Optimizations
    setupTouchOptimizations() {
        if (!this.touchDevice) return;
        
        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .star, .issue-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Add touch feedback class to body
        document.body.classList.add('touch-device');
        
        // Optimize scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
    }

    // Accessibility Enhancements
    setupAccessibility() {
        // Screen reader announcements
        this.createAriaLiveRegion();
        
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
    }

    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
    }

    announceRating(rating) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            const descriptions = {
                1: 'Poor quality rating selected',
                2: 'Fair quality rating selected', 
                3: 'Good quality rating selected',
                4: 'Great quality rating selected',
                5: 'Excellent quality rating selected'
            };
            announcements.textContent = descriptions[rating];
        }
    }

    setupKeyboardNavigation() {
        // Tab order optimization
        const focusableElements = document.querySelectorAll(
            'button, select, textarea, input, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((el, index) => {
            el.setAttribute('tabindex', index + 1);
        });
    }

    setupFocusManagement() {
        // Focus trap for better accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    // Utility Functions
    triggerHapticFeedback(type = 'impact') {
        if (!this.touchDevice) return;
        
        if (navigator.vibrate) {
            const patterns = {
                impact: [30],
                success: [50, 50, 100],
                error: [100, 50, 100, 50, 100]
            };
            navigator.vibrate(patterns[type] || patterns.impact);
        }
    }

    autoSave() {
        const formData = {
            rating: this.currentRating,
            status: document.getElementById('leadStatus').value,
            issues: Array.from(this.selectedIssues),
            comments: document.getElementById('comments').value,
            timestamp: Date.now()
        };
        
        localStorage.setItem('feedbackDraft', JSON.stringify(formData));
    }

    loadSavedData() {
        const saved = localStorage.getItem('feedbackDraft');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            // Restore rating
            if (data.rating) {
                this.selectRating(data.rating);
            }
            
            // Restore status
            if (data.status) {
                const dropdown = document.getElementById('leadStatus');
                dropdown.value = data.status;
                this.updateStatusStyling(dropdown, data.status);
            }
            
            // Restore issues
            if (data.issues && data.issues.length > 0) {
                data.issues.forEach(issue => {
                    this.selectedIssues.add(issue);
                    const button = document.querySelector(`[data-issue="${issue}"]`);
                    if (button) {
                        button.classList.add('selected');
                    }
                });
                document.getElementById('selectedIssues').value = data.issues.join(',');
            }
            
            // Restore comments
            if (data.comments) {
                const textarea = document.getElementById('comments');
                textarea.value = data.comments;
                document.getElementById('charCount').textContent = data.comments.length;
            }
            
            // Validate form after restoring data
            this.validateForm();
            
        } catch (e) {
            console.warn('Error loading saved data:', e);
            localStorage.removeItem('feedbackDraft');
        }
    }

    addPageLoadAnimation() {
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackSystem();
});

// Additional CSS for enhanced interactions
const additionalStyles = `
    .field-error {
        border-color: #EF4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
    }
    
    .validation-error {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
        color: #DC2626;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 8px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #FECACA;
        animation: slideIn 0.3s ease;
    }
    
    .validation-error svg {
        color: #DC2626;
        flex-shrink: 0;
    }
    
    .submit-btn.disabled {
        background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%) !important;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
    
    .submit-btn.ready {
        box-shadow: 0 4px 14px rgba(30, 64, 175, 0.4);
    }
    
    .rating-description {
        text-align: center;
        margin-top: 12px;
    }
    
    .rating-text {
        font-size: 14px;
        font-weight: 500;
        color: #64748B;
        transition: color 0.3s ease;
    }
    
    .select-wrapper.focused .status-dropdown {
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }
    
    .textarea-wrapper.focused .comment-textarea {
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }
    
    .status-new { border-color: #94A3B8; }
    .status-progress { border-color: #3B82F6; }
    .status-success { border-color: #22C55E; }
    .status-failed { border-color: #EF4444; }
    
    .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .success-modal.show {
        opacity: 1;
    }
    
    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        padding: 32px 24px;
        text-align: center;
        max-width: 320px;
        width: 100%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .success-modal.show .modal-content {
        transform: scale(1);
    }
    
    .success-icon {
        background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
        color: white;
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
    }
    
    .modal-content h3 {
        font-size: 20px;
        font-weight: 600;
        color: #0F172A;
        margin-bottom: 12px;
    }
    
    .modal-content p {
        font-size: 14px;
        color: #64748B;
        line-height: 1.5;
        margin-bottom: 24px;
    }
    
    .modal-close-btn {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .modal-close-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .touch-device .star,
    .touch-device .issue-btn {
        min-height: 48px;
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .system-error {
        background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
        color: #DC2626;
        padding: 16px 20px;
        border-radius: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid #FECACA;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    }
    
    .system-error svg {
        color: #DC2626;
        flex-shrink: 0;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);