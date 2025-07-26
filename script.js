class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.currentTheme = this.getSavedTheme() || 'light';
        this.init();
    }

    getSavedTheme() {
        return window.savedTheme || 'light';
    }

    saveTheme(theme) {
        window.savedTheme = theme;
    }

    init() {
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        const icon = this.themeToggle.querySelector('i');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        this.currentTheme = theme;
        this.saveTheme(theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}
class ScrollManager {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scrollToTop');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            this.scrollToTopBtn.classList.add('visible');
        } else {
            this.scrollToTopBtn.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

class SocialShareManager {
    constructor() {
        this.shareButtons = document.querySelectorAll('.share-btn');
        this.copyLinkBtn = document.getElementById('copyLink');
        this.tooltip = document.getElementById('copyTooltip');
        this.init();
    }

    init() {
        this.shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleShare(e);
            });
        });
    }

    handleShare(e) {
        const platform = e.currentTarget.dataset.platform;
        const url = window.location.href;
        const title = document.title;
        const text = document.querySelector('.post-subtitle').textContent;

        switch (platform) {
            case 'linkedin':
                this.shareOnLinkedIn(url, title);
                break;
            case 'twitter':
                this.shareOnTwitter(url, title);
                break;
            case 'facebook':
                this.shareOnFacebook(url);
                break;
            default:
                if (e.currentTarget.id === 'copyLink') {
                    this.copyToClipboard(url);
                }
        }
    }

    shareOnLinkedIn(url, title) {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        this.openShareWindow(linkedInUrl);
    }

    shareOnTwitter(url, title) {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        this.openShareWindow(twitterUrl);
    }

    shareOnFacebook(url) {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        this.openShareWindow(facebookUrl);
    }

    openShareWindow(url) {
        window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showTooltip();
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
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
            this.showTooltip();
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    showTooltip() {
        const copyButton = this.copyLinkBtn;
        const rect = copyButton.getBoundingClientRect();
        
        this.tooltip.style.left = rect.left + (rect.width / 2) - (this.tooltip.offsetWidth / 2) + 'px';
        this.tooltip.style.top = rect.top - this.tooltip.offsetHeight - 10 + 'px';
        
        this.tooltip.classList.add('show');
        
        setTimeout(() => {
            this.tooltip.classList.remove('show');
        }, 2000);
    }
}
class NavigationManager {
    constructor() {
        this.tocLinks = document.querySelectorAll('.table-of-contents a');
        this.init();
    }

    init() {
        this.tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed header if any
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}
class ReadingProgressManager {
    constructor() {
        this.createProgressBar();
        this.init();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);

        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: var(--border-color);
                z-index: 1001;
            }
            .reading-progress-fill {
                height: 100%;
                background: var(--accent-primary);
                width: 0%;
                transition: width 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }

    init() {
        window.addEventListener('scroll', () => {
            this.updateProgress();
        });
    }

    updateProgress() {
        const article = document.querySelector('.post-content');
        if (!article) return;

        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;

        const articleBottom = articleTop + articleHeight;
        const windowBottom = scrollTop + windowHeight;

        let progress = 0;
        if (scrollTop > articleTop) {
            progress = (scrollTop - articleTop) / (articleHeight - windowHeight);
            progress = Math.max(0, Math.min(1, progress));
        }

        const progressFill = document.querySelector('.reading-progress-fill');
        if (progressFill) {
            progressFill.style.width = (progress * 100) + '%';
        }
    }
}
class ImageManager {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupLazyLoading();
        }
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        this.images.forEach(img => {
            imageObserver.observe(img);
        });
        const style = document.createElement('style');
        style.textContent = `
            img[loading="lazy"] {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            img[loading="lazy"].loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
}
class KeyboardManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 't' || e.key === 'T') {
                if (!this.isInputFocused()) {
                    e.preventDefault();
                    document.getElementById('themeToggle').click();
                }
            }
            
            if (e.key === 'Home' && e.ctrlKey) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (e.key === 'End' && e.ctrlKey) {
                e.preventDefault();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });
    }

    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    const scrollManager = new ScrollManager();
    const socialShareManager = new SocialShareManager();
    const navigationManager = new NavigationManager();
    
    const readingProgressManager = new ReadingProgressManager();
    const imageManager = new ImageManager();
    const keyboardManager = new KeyboardManager();
    document.body.classList.add('loaded');
    const style = document.createElement('style');
    style.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        body.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});

window.addEventListener('resize', () => {
    const tooltip = document.getElementById('copyTooltip');
    if (tooltip.classList.contains('show')) {
        tooltip.classList.remove('show');
    }
});


document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
    } else {
    }
});
