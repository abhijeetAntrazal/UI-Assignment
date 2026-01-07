// DOM Helper - A simple framework for DOM manipulation
class DOMHelper {
    select(selector) {
        return document.querySelector(selector);
    }

    selectAll(selector) {
        return document.querySelectorAll(selector);
    }

    on(selector, event, callback) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.addEventListener(event, callback);
        }
    }

    onDelegate(parentSelector, childSelector, event, callback) {
        const parent = this.select(parentSelector);
        if (parent) {
            parent.addEventListener(event, (e) => {
                const target = e.target.closest(childSelector);
                if (target) {
                    callback(e, target);
                }
            });
        }
    }

    addClass(selector, className) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.classList.add(className);
        }
    }

    removeClass(selector, className) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.classList.remove(className);
        }
    }

    toggleClass(selector, className) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.classList.toggle(className);
        }
    }

    hasClass(selector, className) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.classList.contains(className) : false;
    }

    setText(selector, text) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.textContent = text;
        }
    }

    setHTML(selector, html) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.innerHTML = html;
        }
    }

    getValue(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.value : '';
    }

    setValue(selector, value) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.value = value;
        }
    }

    // NEW: Set inline styles
    setStyle(selector, property, value) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.style[property] = value;
        }
    }

    // NEW: Set multiple styles at once
    setStyles(selector, styles) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element && typeof styles === 'object') {
            Object.keys(styles).forEach(property => {
                element.style[property] = styles[property];
            });
        }
    }

    // NEW: Get attribute
    getAttribute(selector, attribute) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.getAttribute(attribute) : null;
    }

    // NEW: Set attribute
    setAttribute(selector, attribute, value) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.setAttribute(attribute, value);
        }
    }

    // NEW: Remove attribute
    removeAttribute(selector, attribute) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.removeAttribute(attribute);
        }
    }

    // NEW: Get data attribute
    getData(selector, dataKey) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.dataset[dataKey] : null;
    }

    // NEW: Set data attribute
    setData(selector, dataKey, value) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.dataset[dataKey] = value;
        }
    }

    show(selector) {
        this.removeClass(selector, 'hidden');
    }

    hide(selector) {
        this.addClass(selector, 'hidden');
    }

    toggle(selector) {
        this.toggleClass(selector, 'hidden');
    }

    // NEW: Check if element is visible
    isVisible(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (!element) return false;
        return !element.classList.contains('hidden') && 
               element.style.display !== 'none' &&
               element.offsetParent !== null;
    }

    // NEW: Enable/disable form elements
    enable(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.disabled = false;
        }
    }

    disable(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.disabled = true;
        }
    }

    // NEW: Focus on element
    focus(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.focus();
        }
    }

    // NEW: Remove element from DOM
    remove(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // NEW: Append HTML to element
    append(selector, html) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.insertAdjacentHTML('beforeend', html);
        }
    }

    // NEW: Prepend HTML to element
    prepend(selector, html) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.insertAdjacentHTML('afterbegin', html);
        }
    }

    // NEW: Clear all child elements
    empty(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            element.innerHTML = '';
        }
    }

    // NEW: Check if element exists
    exists(selector) {
        return this.select(selector) !== null;
    }

    // NEW: Get/Set inner text (alternative to textContent)
    getText(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.textContent : '';
    }

    // NEW: Trigger custom event
    trigger(selector, eventName, detail = {}) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (element) {
            const event = new CustomEvent(eventName, { detail });
            element.dispatchEvent(event);
        }
    }

    // NEW: Get closest parent matching selector
    closest(element, selector) {
        const el = typeof element === 'string' ? this.select(element) : element;
        return el ? el.closest(selector) : null;
    }

    // NEW: Get parent element
    parent(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        return element ? element.parentElement : null;
    }

    // NEW: Get siblings
    siblings(selector) {
        const element = typeof selector === 'string' ? this.select(selector) : selector;
        if (!element || !element.parentNode) return [];
        return Array.from(element.parentNode.children).filter(child => child !== element);
    }
}

export default DOMHelper;
