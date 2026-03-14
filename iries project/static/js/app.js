// AgriPredict Pro - Frontend JavaScript

class AgriPredictApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.initializeEventListeners();
        this.initializeAnimations();
        this.loadStats();
    }

    initializeEventListeners() {
        // Yield prediction form
        const yieldForm = document.getElementById('yieldForm');
        if (yieldForm) {
            yieldForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleYieldPrediction();
            });
        }

        // Price prediction form
        const priceForm = document.getElementById('priceForm');
        if (priceForm) {
            priceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePricePrediction();
            });
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    initializeAnimations() {
        // Animate elements on scroll
        this.setupScrollAnimations();
        
        // Animate stats counter
        this.animateCounters();
        
        // Setup particle system
        this.setupParticles();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        // Remove previous validation classes
        field.classList.remove('valid', 'invalid');
        
        if (value === '') {
            return;
        }
        
        let isValid = true;
        
        // Specific validation rules
        switch (fieldName) {
            case 'area':
            case 'rainfall':
            case 'fertilizer':
            case 'current_stock':
                isValid = !isNaN(value) && parseFloat(value) > 0;
                break;
            case 'temperature':
                isValid = !isNaN(value) && parseFloat(value) > -50 && parseFloat(value) < 60;
                break;
            default:
                isValid = value.length > 0;
        }
        
        if (isValid) {
            field.classList.add('valid');
            field.style.borderColor = '#4CAF50';
        } else {
            field.classList.add('invalid');
            field.style.borderColor = '#f44336';
        }
        
        return isValid;
    }

    async handleYieldPrediction() {
        const form = document.getElementById('yieldForm');
        const submitBtn = form.querySelector('.predict-btn');
        const resultDiv = document.getElementById('yieldResult');
        const errorDiv = document.getElementById('yieldError');
        
        // Validate form
        if (!this.validateForm(form)) {
            this.showError(errorDiv, 'Please fill in all required fields correctly.');
            return;
        }
        
        // Show loading state
        this.setLoadingState(submitBtn, true, 'Predicting Yield...');
        this.hideResult(resultDiv);
        this.hideError(errorDiv);
        
        try {
            const formData = new FormData(form);
            const data = this.formDataToObject(formData);
            
            // Convert numeric fields
            data.area = parseFloat(data.area);
            data.rainfall = parseFloat(data.rainfall);
            data.temperature = parseFloat(data.temperature);
            data.fertilizer = parseFloat(data.fertilizer);
            
            const response = await fetch('/predict_yield', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showYieldResult(result);
            } else {
                throw new Error(result.error || 'Prediction failed');
            }
            
        } catch (error) {
            console.error('Yield prediction error:', error);
            this.showError(errorDiv, 'Failed to predict yield. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, false, '<i class="fas fa-brain"></i> Predict Yield');
        }
    }

    async handlePricePrediction() {
        const form = document.getElementById('priceForm');
        const submitBtn = form.querySelector('.predict-btn');
        const resultDiv = document.getElementById('priceResult');
        const errorDiv = document.getElementById('priceError');
        
        // Validate form
        if (!this.validateForm(form)) {
            this.showError(errorDiv, 'Please fill in all required fields correctly.');
            return;
        }
        
        // Show loading state
        this.setLoadingState(submitBtn, true, 'Predicting Price...');
        this.hideResult(resultDiv);
        this.hideError(errorDiv);
        
        try {
            const formData = new FormData(form);
            const data = this.formDataToObject(formData);
            
            // Convert numeric fields
            data.current_stock = parseFloat(data.current_stock);
            
            const response = await fetch('/predict_price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showPriceResult(result);
            } else {
                throw new Error(result.error || 'Prediction failed');
            }
            
        } catch (error) {
            console.error('Price prediction error:', error);
            this.showError(errorDiv, 'Failed to predict price. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, false, '<i class="fas fa-coins"></i> Predict Price');
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    formDataToObject(formData) {
        const object = {};
        formData.forEach((value, key) => {
            object[key] = value;
        });
        return object;
    }

    setLoadingState(button, isLoading, text) {
        if (isLoading) {
            button.classList.add('loading');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + text;
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.innerHTML = text;
            button.disabled = false;
        }
    }

    showYieldResult(result) {
        const resultDiv = document.getElementById('yieldResult');
        const valueElement = document.getElementById('yieldValue');
        const confidenceElement = document.getElementById('yieldConfidence');
        
        valueElement.textContent = `${result.prediction} ${result.unit}`;
        confidenceElement.textContent = `Confidence: ${result.confidence}%`;
        
        this.showResult(resultDiv);
        
        // Add success animation
        this.animateSuccess(valueElement);
    }

    showPriceResult(result) {
        const resultDiv = document.getElementById('priceResult');
        const valueElement = document.getElementById('priceValue');
        const confidenceElement = document.getElementById('priceConfidence');
        
        valueElement.textContent = `${result.prediction} ${result.unit}`;
        confidenceElement.textContent = `Confidence: ${result.confidence}%`;
        
        this.showResult(resultDiv);
        
        // Add success animation
        this.animateSuccess(valueElement);
    }

    showResult(resultDiv) {
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideResult(resultDiv) {
        resultDiv.classList.remove('show');
    }

    showError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideError(errorDiv) {
        errorDiv.classList.remove('show');
    }

    animateSuccess(element) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe stat cards and other elements
        document.querySelectorAll('.stat-card, .prediction-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-value');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (counter.textContent.includes('%')) {
                        counter.textContent = Math.ceil(current) + '%';
                    } else if (counter.textContent.includes('K')) {
                        counter.textContent = Math.ceil(current / 1000) + 'K+';
                    } else if (counter.textContent.includes('+')) {
                        counter.textContent = Math.ceil(current) + '+';
                    } else {
                        counter.textContent = Math.ceil(current);
                    }
                    requestAnimationFrame(updateCounter);
                }
            };
            
            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    setupParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Create floating particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 20 + 20) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            if (response.ok) {
                this.updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        // Update stat values if needed
        const statElements = document.querySelectorAll('.stat-value');
        statElements.forEach(element => {
            const label = element.nextElementSibling.textContent.toLowerCase();
            if (label.includes('accuracy')) {
                element.textContent = stats.accuracy_rate + '%';
            } else if (label.includes('crop')) {
                element.textContent = stats.crop_varieties + '+';
            } else if (label.includes('prediction')) {
                element.textContent = (stats.total_predictions / 1000).toFixed(1) + 'K+';
            } else if (label.includes('user')) {
                element.textContent = (stats.active_users / 1000).toFixed(1) + 'K+';
            }
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agriPredictApp = new AgriPredictApp();
    
    // Add some interactive effects
    document.querySelectorAll('.prediction-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.predict-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .predict-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .valid {
        border-color: #4CAF50 !important;
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1) !important;
    }
    
    .invalid {
        border-color: #f44336 !important;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
    }
`;
document.head.appendChild(style);