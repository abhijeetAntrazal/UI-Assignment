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

    show(selector) {
        this.removeClass(selector, 'hidden');
    }

    hide(selector) {
        this.addClass(selector, 'hidden');
    }

    toggle(selector) {
        this.toggleClass(selector, 'hidden');
    }
}

export default DOMHelper;