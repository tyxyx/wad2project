/*==========
Theme Name: Foodify - Food HTML5 Template
Theme Version: 1.0
==========*/

var html = document.documentElement;
var body = document.body;

var scroller = {
    target: document.querySelector("#js-scroll-content"),
    ease: 0.08, // <= scroll speed
    endY: 0,
    y: 0,
    resizeRequest: 1,
    scrollRequest: 0,
};

var requestId = null;

TweenLite.set(scroller.target, {
    rotation: 0.001,
    force3D: true,
});

// Function to calculate and update scroll height
function updateScrollHeight() {
    const content = document.querySelector("#js-scroll-content");
    const footer = document.querySelector(".bottom-footer");
    if (!content || !footer) return;
    
    // Get the actual content height including the footer
    const totalHeight = content.getBoundingClientRect().height;
    const viewportHeight = window.innerHeight;
    
    // Ensure minimum body height accounts for viewport and content
    const minHeight = Math.max(totalHeight, viewportHeight);
    
    // Set body height to accommodate full scrolling
    document.body.style.height = `${minHeight}px`;
}

function onLoad() {
    updateScrollHeight();
    updateScroller();
    window.focus();
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll);
}

function updateScroller() {
    var resized = scroller.resizeRequest > 0;

    if (resized) {
        updateScrollHeight();
        scroller.resizeRequest = 0;
    }

    var scrollY = window.pageYOffset || html.scrollTop || body.scrollTop || 0;

    scroller.endY = scrollY;
    scroller.y += (scrollY - scroller.y) * scroller.ease;

    if (Math.abs(scrollY - scroller.y) < 0.05 || resized) {
        scroller.y = scrollY;
        scroller.scrollRequest = 0;
    }

    TweenLite.set(scroller.target, {
        y: -scroller.y,
    });

    requestId = scroller.scrollRequest > 0 ? requestAnimationFrame(updateScroller) : null;
}

function onScroll() {
    scroller.scrollRequest++;
    if (!requestId) {
        requestId = requestAnimationFrame(updateScroller);
    }
}

function onResize() {
    updateScrollHeight();
    scroller.resizeRequest++;
    if (!requestId) {
        requestId = requestAnimationFrame(updateScroller);
    }
}

// Initialize on page load
window.addEventListener("load", onLoad);

// Add content observer
const contentObserver = new MutationObserver(updateScrollHeight);
if (scroller.target) {
    contentObserver.observe(scroller.target, {
        childList: true,
        subtree: true
    });
}

// Filter clicks handler
jQuery(".filters").on("click", function() {
    setTimeout(function() {
        onScroll();
        onResize();
    }, 1000);
});

// Scroll to top functionality
const scrolltotop = document.querySelector(".scrolltop");
if (scrolltotop) {
    scrolltotop.addEventListener("click", () => {
        gsap.to(window, {
            scrollTo: 0,
            duration: 1
        });
    });
}

// Scroll to Section functionality
const navLinks = document.querySelectorAll(".food-nav-menu a");
navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            gsap.to(window, {
                scrollTo: targetSection,
                duration: 1
            });
        }
    });
});

// Show/hide scroll to top button
window.addEventListener("scroll", () => {
    const scrollButton = document.querySelector(".scrolltop");
    if (scrollButton) {
        if (window.scrollY > 300) {
            scrollButton.classList.add("show");
        } else {
            scrollButton.classList.remove("show");
        }
    }
});
