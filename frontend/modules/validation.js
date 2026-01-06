// Validation Framework - Function that returns function pattern
class ValidationFramework {
    required(fieldName) {
        return (value) => {
            if (!value || value.trim() === '') {
                return `${fieldName} is required`;
            }
            return null;
        };
    }

    minLength(length, fieldName) {
        return (value) => {
            if (value && value.length < length) {
                return `${fieldName} must be at least ${length} characters`;
            }
            return null;
        };
    }

    maxLength(length, fieldName) {
        return (value) => {
            if (value && value.length > length) {
                return `${fieldName} must not exceed ${length} characters`;
            }
            return null;
        };
    }

    validEmail() {
        return (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
            return null;
        };
    }

    validPhone() {
        return (value) => {
            const phoneRegex = /^[0-9]{10}$/;
            if (value && !phoneRegex.test(value.replace(/[\s()-]/g, ''))) {
                return 'Please enter a valid 10-digit phone number';
            }
            return null;
        };
    }

    pattern(regex, message) {
        return (value) => {
            if (value && !regex.test(value)) {
                return message;
            }
            return null;
        };
    }

    validateForm(values, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const fieldRules = rules[field];
            const value = values[field];

            for (let rule of fieldRules) {
                const error = rule(value);
                if (error) {
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(error);
                    break;
                }
            }
        });

        return errors;
    }
}

export default ValidationFramework;