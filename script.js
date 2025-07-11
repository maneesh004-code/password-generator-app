// Password Generator JavaScript

class PasswordGenerator {
    constructor() {
        this.characterSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.elements = {
            passwordOutput: document.getElementById('passwordOutput'),
            passwordActions: document.getElementById('passwordActions'),
            copyBtn: document.getElementById('copyBtn'),
            strengthIndicator: document.getElementById('strengthIndicator'),
            strengthValue: document.getElementById('strengthValue'),
            strengthFill: document.getElementById('strengthFill'),
            lengthSlider: document.getElementById('lengthSlider'),
            lengthValue: document.getElementById('lengthValue'),
            generateBtn: document.getElementById('generateBtn'),
            successMessage: document.getElementById('successMessage'),
            checkboxes: {
                uppercase: document.getElementById('uppercase'),
                lowercase: document.getElementById('lowercase'),
                numbers: document.getElementById('numbers'),
                special: document.getElementById('special')
            }
        };
        
        this.currentPassword = '';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateSliderBackground();
    }
    
    setupEventListeners() {
        // Generate button
        this.elements.generateBtn.addEventListener('click', () => this.generatePassword());
        
        // Copy button
        this.elements.copyBtn.addEventListener('click', () => this.copyPassword());
        
        // Length slider
        this.elements.lengthSlider.addEventListener('input', (e) => {
            this.elements.lengthValue.textContent = e.target.value;
            this.updateSliderBackground();
        });
        
        // Generate password on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.generatePassword();
            }
        });
    }
    
    updateSliderBackground() {
        const slider = this.elements.lengthSlider;
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #4b5563 ${value}%, #4b5563 100%)`;
    }
    
    generatePassword() {
        const length = parseInt(this.elements.lengthSlider.value);
        const options = this.getSelectedOptions();
        
        if (options.length === 0) {
            alert('Please select at least one character type');
            return;
        }
        
        const password = this.createPassword(length, options);
        this.displayPassword(password);
        this.updateStrengthIndicator(password);
        this.hideSuccessMessage();
    }
    
    getSelectedOptions() {
        const options = [];
        Object.keys(this.elements.checkboxes).forEach(key => {
            if (this.elements.checkboxes[key].checked) {
                options.push(key);
            }
        });
        return options;
    }
    
    createPassword(length, options) {
        let availableChars = '';
        let guaranteedChars = '';
        
        // Build character set and guarantee at least one character from each selected type
        options.forEach(option => {
            const chars = this.characterSets[option];
            availableChars += chars;
            guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
        });
        
        // Fill the rest of the password length with random characters
        let password = guaranteedChars;
        for (let i = guaranteedChars.length; i < length; i++) {
            password += availableChars[Math.floor(Math.random() * availableChars.length)];
        }
        
        // Shuffle the password to randomize the guaranteed characters
        return this.shuffleString(password);
    }
    
    shuffleString(str) {
        return str.split('').sort(() => Math.random() - 0.5).join('');
    }
    
    displayPassword(password) {
        this.currentPassword = password;
        this.elements.passwordOutput.textContent = password;
        this.elements.passwordOutput.classList.remove('placeholder');
        this.elements.passwordActions.style.display = 'flex';
    }
    
    calculateStrength(password) {
        let score = 0;
        
        // Length criteria
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Character type criteria
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        return score;
    }
    
    getStrengthInfo(score) {
        if (score <= 2) {
            return { label: 'Weak', class: 'weak', width: 33 };
        } else if (score <= 4) {
            return { label: 'Medium', class: 'medium', width: 66 };
        } else {
            return { label: 'Strong', class: 'strong', width: 100 };
        }
    }
    
    updateStrengthIndicator(password) {
        const strength = this.calculateStrength(password);
        const strengthInfo = this.getStrengthInfo(strength);
        
        // Update strength value
        this.elements.strengthValue.textContent = strengthInfo.label;
        this.elements.strengthValue.className = `strength-value ${strengthInfo.class}`;
        
        // Update strength bar
        this.elements.strengthFill.className = `strength-fill ${strengthInfo.class}`;
        this.elements.strengthFill.style.width = `${strengthInfo.width}%`;
        
        // Show strength indicator
        this.elements.strengthIndicator.style.display = 'flex';
    }
    
    async copyPassword() {
        try {
            await navigator.clipboard.writeText(this.currentPassword);
            this.showSuccessMessage();
        } catch (err) {
            console.error('Failed to copy password:', err);
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(this.currentPassword);
        }
    }
    
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccessMessage();
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    showSuccessMessage() {
        this.elements.successMessage.style.display = 'flex';
        setTimeout(() => {
            this.hideSuccessMessage();
        }, 3000);
    }
    
    hideSuccessMessage() {
        this.elements.successMessage.style.display = 'none';
    }
}

// Initialize the password generator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// Additional utility functions
function debounce(func, wait) {
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

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
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
    }
    
    // Add hover effects to checkboxes
    const checkboxes = document.querySelectorAll('.option-item');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        checkbox.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .generate-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);