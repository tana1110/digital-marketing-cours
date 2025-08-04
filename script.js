// Global navigation functions (available before DOM loads)

// Function to control navbar visibility
function updateNavbarVisibility(section) {
    const navbar = document.getElementById('top-nav');
    if (navbar) {
        // Hide navbar on landing page and completion page only
        if (section === 'landing' || section === 'completion') {
            navbar.style.display = 'none';
        } else {
            navbar.style.display = 'block';
        }
    }
}

function showOverview() {
    const landingPage = document.getElementById('landing-page');
    const courseOverview = document.getElementById('course-overview');
    const courseContainer = document.getElementById('course-container');
    const pageDisplay = document.getElementById('page-display');
    
    landingPage.style.display = 'none';
    courseOverview.style.display = 'block';
    courseContainer.style.display = 'none';
    pageDisplay.style.display = 'none';
    
    updateNavigationState('overview');
    updateNavbarVisibility('overview');
}

function showUnits() {
    const landingPage = document.getElementById('landing-page');
    const courseOverview = document.getElementById('course-overview');
    const courseContainer = document.getElementById('course-container');
    const pageDisplay = document.getElementById('page-display');
    
    landingPage.style.display = 'none';
    courseOverview.style.display = 'none';
    courseContainer.style.display = 'block';
    pageDisplay.style.display = 'none';
    
    updateNavigationState('units');
    updateNavbarVisibility('units');
}

function showProgress() {
    // Show a progress modal or section
    const completedPages = getCompletedPagesCount();
    const totalPages = 20;
    const progressPercent = Math.round((completedPages / totalPages) * 100);
    
    alert(`📊 تقدمك في الكورس:\n\n` +
          `الصفحات المكتملة: ${completedPages} من ${totalPages}\n` +
          `النسبة المئوية: ${progressPercent}%\n\n` +
          `استمر في التعلم! 💪`);
}

function updateNavigationState(activeSection) {
    // Update active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.getElementById(`nav-${activeSection}`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update progress indicator
    updateNavigationProgress();
}

function updateNavigationProgress() {
    const completedPages = getCompletedPagesCount();
    const totalPages = 20;
    const progressPercent = Math.round((completedPages / totalPages) * 100);
    
    const progressText = document.getElementById('nav-progress-text');
    const progressFill = document.getElementById('nav-progress-fill');
    const progressIndicator = document.getElementById('nav-progress-indicator');
    const navProgress = document.getElementById('nav-progress');
    
    if (progressText && progressFill && progressIndicator && navProgress) {
        progressText.textContent = `${completedPages}/${totalPages}`;
        progressFill.style.width = `${progressPercent}%`;
        
        // Show progress elements if user has started the course
        if (completedPages > 0) {
            progressIndicator.style.display = 'flex';
            navProgress.style.display = 'block';
        } else {
            progressIndicator.style.display = 'none';
            navProgress.style.display = 'none';
        }
    }
}

function getCompletedPagesCount() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]:checked');
    return checkboxes.length;
}

document.addEventListener('DOMContentLoaded', () => {
    // Page elements
    const landingPage = document.getElementById('landing-page');
    const courseOverview = document.getElementById('course-overview');
    const courseContainer = document.getElementById('course-container');
    const pageDisplay = document.getElementById('page-display');
    const pageContent = document.getElementById('page-content');
    const pageStorage = document.getElementById('page-storage');
    
    // Handle video loading issues
    const heroVideo = document.querySelector('.hero-image');
    if (heroVideo && heroVideo.tagName === 'VIDEO') {
        heroVideo.addEventListener('error', function() {
            console.log('Video failed to load, showing fallback image');
            // If video fails, show the fallback image
            const fallbackImg = heroVideo.querySelector('img');
            if (fallbackImg) {
                heroVideo.style.display = 'none';
                fallbackImg.style.display = 'block';
            }
        });
        
        // Ensure video plays on user interaction if autoplay fails
        heroVideo.addEventListener('loadeddata', function() {
            heroVideo.play().catch(function(error) {
                console.log('Autoplay prevented:', error);
                // Autoplay was prevented, but video is loaded
            });
        });
    }

    // Buttons
    const landingBtn = document.getElementById('landing-btn');
    const startBtn = document.getElementById('start-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const clearProgressBtn = document.getElementById('clear-progress-btn');
    const progressIndicator = document.getElementById('progress-indicator');
    const heroImageContainer = document.getElementById('hero-image-container');
    
    // State variables
    let currentUnitId = null;
    let currentPageIndex = 0;
    let currentPages = [];
    
    // Completion tracking
    const totalPages = 20; // 5 units with total 20 pages
    const completionMessage = document.getElementById('completion-message');

    // LocalStorage keys
    const STORAGE_KEYS = {
        COMPLETED_PAGES: 'course_completed_pages',
        CURRENT_UNIT: 'course_current_unit',
        CURRENT_PAGE: 'course_current_page',
        CURRENT_SECTION: 'course_current_section'
    };

    // --- Data Persistence Functions ---
    
    function saveProgress() {
        // Save completed pages
        const completedPages = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]:checked');
        checkboxes.forEach(checkbox => {
            completedPages.push(checkbox.id);
        });
        localStorage.setItem(STORAGE_KEYS.COMPLETED_PAGES, JSON.stringify(completedPages));
        
        // Save current position
        localStorage.setItem(STORAGE_KEYS.CURRENT_UNIT, currentUnitId || '');
        localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPageIndex.toString());
        
        // Save current section (landing, overview, course, page)
        if (landingPage.style.display !== 'none') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, 'landing');
        } else if (courseOverview.style.display !== 'none') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, 'overview');
        } else if (courseContainer.style.display !== 'none') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, 'course');
        } else if (pageDisplay.style.display !== 'none') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SECTION, 'page');
        }
        
        // Update UI to show/hide progress elements
        updateProgressUI();
    }

    function loadProgress() {
        // Load completed pages
        const completedPagesJson = localStorage.getItem(STORAGE_KEYS.COMPLETED_PAGES);
        if (completedPagesJson) {
            const completedPages = JSON.parse(completedPagesJson);
            completedPages.forEach(checkboxId => {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }

        // Load current position
        const savedUnit = localStorage.getItem(STORAGE_KEYS.CURRENT_UNIT);
        const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
        const savedSection = localStorage.getItem(STORAGE_KEYS.CURRENT_SECTION);
        
        return {
            unit: savedUnit,
            page: parseInt(savedPage) || 0,
            section: savedSection
        };
    }

    function clearProgress() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reset all checkboxes
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset state
        currentUnitId = null;
        currentPageIndex = 0;
        currentPages = [];
    }

    // --- Initial Navigation ---

    // Function to navigate to course overview
    function navigateToOverview() {
        landingPage.style.display = 'none';
        courseOverview.style.display = 'block';
        updateNavbarVisibility('overview');
        saveProgress();
    }

    // Landing button click event
    if (landingBtn) {
        landingBtn.addEventListener('click', navigateToOverview);
    }

    // Bottom text click event
    const bottomText = document.querySelector('.bottom-text');
    if (bottomText) {
        bottomText.addEventListener('click', navigateToOverview);
    }

    // Hero image click event - navigate to overview page
    if (heroImageContainer) {
        heroImageContainer.addEventListener('click', navigateToOverview);
    }

    startBtn.addEventListener('click', () => {
        courseOverview.style.display = 'none';
        showUnitList();
        updateNavbarVisibility('units');
        saveProgress();
    });

    // Show clear progress button and progress indicator if user has made progress
    function updateProgressUI() {
        const savedProgress = loadProgress();
        const hasProgress = savedProgress.section && savedProgress.section !== 'landing';
        
        if (hasProgress) {
            if (clearProgressBtn) clearProgressBtn.style.display = 'block';
            if (progressIndicator) progressIndicator.style.display = 'block';
        } else {
            if (clearProgressBtn) clearProgressBtn.style.display = 'none';
            if (progressIndicator) progressIndicator.style.display = 'none';
        }
        
        // Update navigation progress
        updateNavigationProgress();
    }

    // Load progress when page loads
    function restoreProgress() {
        const savedProgress = loadProgress();
        updateProgressUI();
        
        if (savedProgress.section && savedProgress.section !== 'landing') {
            // User has made progress, restore their position
            switch (savedProgress.section) {
                case 'overview':
                    landingPage.style.display = 'none';
                    courseOverview.style.display = 'block';
                    updateNavbarVisibility('overview');
                    break;
                case 'course':
                    landingPage.style.display = 'none';
                    courseOverview.style.display = 'none';
                    updateNavbarVisibility('units');
                    if (savedProgress.unit) {
                        currentUnitId = savedProgress.unit;
                        const pageListContainer = document.getElementById(`unit${savedProgress.unit}-pages`);
                        if (pageListContainer) {
                            currentPages = Array.from(pageListContainer.querySelectorAll('.page-title'));
                        }
                        showUnitList();
                        showPageList(savedProgress.unit);
                    } else {
                        showUnitList();
                    }
                    break;
                case 'page':
                    if (savedProgress.unit && savedProgress.page !== undefined) {
                        landingPage.style.display = 'none';
                        courseOverview.style.display = 'none';
                        updateNavbarVisibility('page');
                        currentUnitId = savedProgress.unit;
                        currentPageIndex = savedProgress.page;
                        const pageListContainer = document.getElementById(`unit${savedProgress.unit}-pages`);
                        if (pageListContainer) {
                            currentPages = Array.from(pageListContainer.querySelectorAll('.page-title'));
                            if (currentPages[currentPageIndex]) {
                                const pageId = currentPages[currentPageIndex].dataset.pageId;
                                showPage(pageId);
                            } else {
                                showUnitList();
                                showPageList(savedProgress.unit);
                            }
                        } else {
                            showUnitList();
                        }
                    }
                    break;
            }
        }
    }
    
    // --- Core Logic ---

    function showUnitList() {
        courseContainer.style.display = 'block';
        pageDisplay.style.display = 'none';
        document.querySelectorAll('.page-list-container').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.unit').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.unit-header').forEach(el => el.style.display = 'flex');
        saveProgress();
    }

    function showPageList(unitId) {
        currentUnitId = unitId;
        document.querySelectorAll('.unit').forEach(unit => {
            if (unit.id !== `unit${unitId}`) {
                unit.style.display = 'none';
            }
        });
        const pageList = document.getElementById(`unit${unitId}-pages`);
        if (pageList) {
            pageList.style.display = 'block';
        }
        saveProgress();
    }

    function showPage(pageId) {
        // Hide list view and show page view
        courseContainer.style.display = 'none';
        pageDisplay.style.display = 'block';

        const contentEl = document.getElementById(`${pageId}-content`);
        if (contentEl) {
            pageContent.innerHTML = contentEl.innerHTML;
        } else {
            pageContent.innerHTML = '<p>المحتوى غير متوفر حالياً.</p>';
        }
        
        // Update navigation
        updatePageNavigation();
        saveProgress();
    }
    
    function updatePageNavigation() {
        const pageCounter = document.getElementById('page-counter');
        pageCounter.textContent = `صفحة ${currentPageIndex + 1} من ${currentPages.length}`;
        
        // Update previous button visibility and functionality
        if (prevPageBtn) {
            if (currentPageIndex <= 0) {
                prevPageBtn.disabled = true;
                prevPageBtn.style.opacity = '0.5';
            } else {
                prevPageBtn.disabled = false;
                prevPageBtn.style.opacity = '1';
            }
        }
        
        // Update next button text and functionality
        if (currentPageIndex >= currentPages.length - 1) {
            // Check if this is the last unit
            const nextUnitId = parseInt(currentUnitId) + 1;
            const nextUnit = document.getElementById(`unit${nextUnitId}`);
            
            if (nextUnit) {
                nextPageBtn.innerHTML = 'التالي <span class="arrow">→</span>';
                nextPageBtn.title = 'الانتقال للوحدة التالية';
            } else {
                nextPageBtn.innerHTML = 'إنهاء الكورس <span class="arrow">🏆</span>';
                nextPageBtn.title = 'إنهاء الكورس';
            }
        } else {
            nextPageBtn.innerHTML = 'التالي <span class="arrow">→</span>';
            nextPageBtn.title = 'الصفحة التالية';
        }
    }
    
    // Function to check if all pages are completed
    function checkAllPagesCompleted() {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]');
        const completedCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]:checked');
        
        if (allCheckboxes.length === completedCheckboxes.length && allCheckboxes.length === totalPages) {
            showCompletionMessage();
        }
    }
    
    // Function to show the completion/congratulations screen
    function showCompletionMessage() {
        // Hide all other sections
        landingPage.style.display = 'none';
        courseOverview.style.display = 'none';
        courseContainer.style.display = 'none';
        pageDisplay.style.display = 'none';
        
        // Show completion message with animation
        completionMessage.style.display = 'flex';
        
        // Hide navbar on completion page
        updateNavbarVisibility('completion');
        
        // Add some celebration effects
        setTimeout(() => {
            // Optional: Play a success sound here if you have one
            console.log('🎉 Course completed! Congratulations! 🎉');
        }, 500);
    }
    
    // Function to handle unit completion and progression
    function handleUnitCompletion() {
        // Check if all pages are completed after a brief delay
        setTimeout(() => {
            const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]');
            const completedCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-check"]:checked');
            
            // If all pages are completed, show completion message
            if (allCheckboxes.length === completedCheckboxes.length && allCheckboxes.length === totalPages) {
                showCompletionMessage();
                return;
            }
            
            // Otherwise, try to move to next unit
            moveToNextUnit();
        }, 100);
    }
    
    // Function to move to the next unit automatically
    function moveToNextUnit() {
        const nextUnitId = parseInt(currentUnitId) + 1;
        const nextUnit = document.getElementById(`unit${nextUnitId}`);
        
        if (nextUnit) {
            // Move to next unit
            const nextUnitPages = document.getElementById(`unit${nextUnitId}-pages`);
            if (nextUnitPages) {
                currentPages = Array.from(nextUnitPages.querySelectorAll('.page-title'));
                currentPageIndex = 0;
                
                // Show the first page of the next unit
                if (currentPages.length > 0) {
                    currentUnitId = nextUnitId.toString();
                    const firstPageId = currentPages[0].dataset.pageId;
                    showPage(firstPageId);
                } else {
                    // Fallback to unit list if no pages found
                    pageDisplay.style.display = 'none';
                    showUnitList();
                    showPageList(nextUnitId);
                }
            }
        } else {
            // No more units, show completion
            showCompletionMessage();
        }
    }
    
    // --- Event Listeners ---

    // 1. Clicking on a Unit Header
    courseContainer.addEventListener('click', (e) => {
        const unitHeader = e.target.closest('.unit-header');
        if (unitHeader) {
            const unitId = unitHeader.dataset.unitId;
            const pageListContainer = document.getElementById(`unit${unitId}-pages`);
            if(pageListContainer){
                currentPages = Array.from(pageListContainer.querySelectorAll('.page-title'));
                showPageList(unitId);
            }
        }
    });

    // 2. Clicking on a Page Title
    courseContainer.addEventListener('click', (e) => {
        const pageTitle = e.target.closest('.page-title');
        if (pageTitle) {
            const pageId = pageTitle.dataset.pageId;
            currentPageIndex = currentPages.findIndex(p => p.dataset.pageId === pageId);
            showPage(pageId);
        }
    });
    
    // 3. Clicking "Back to Units" from a page list
    courseContainer.addEventListener('click', (e) => {
        if(e.target.classList.contains('back-to-units')) {
            showUnitList();
        }
    });



    nextPageBtn.addEventListener('click', () => {
        // Mark current page's checkbox as complete
        if (currentPageIndex < currentPages.length) {
            const completedPageId = currentPages[currentPageIndex].dataset.pageId;
            const checkbox = document.querySelector(`input[id="${completedPageId}-check"]`);
            if(checkbox) {
                checkbox.checked = true;
                saveProgress(); // Save immediately when checkbox is checked
            }
        }

        // Move to next page or handle unit completion
        currentPageIndex++;
        if (currentPageIndex < currentPages.length) {
            const nextPageId = currentPages[currentPageIndex].dataset.pageId;
            showPage(nextPageId);
        } else {
            // Finished all pages in the current unit
            handleUnitCompletion();
        }
    });

    // Previous page button event listener
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                const prevPageId = currentPages[currentPageIndex].dataset.pageId;
                showPage(prevPageId);
            }
        });
    }
    
    // Completion screen button handlers
    const restartCourseBtn = document.getElementById('restart-course');
    
    if (restartCourseBtn) {
        restartCourseBtn.addEventListener('click', () => {
            // Clear all saved progress
            clearProgress();
            
            // Go back to landing page
            completionMessage.style.display = 'none';
            landingPage.style.display = 'block';
            courseOverview.style.display = 'none';
            courseContainer.style.display = 'none';
            pageDisplay.style.display = 'none';
            
            // Hide navbar on landing page
            updateNavbarVisibility('landing');
            
            // Save the reset state
            saveProgress();
        });
    }
    
    // Clear progress button handler
    if (clearProgressBtn) {
        clearProgressBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من أنك تريد مسح جميع التقدم والبدء من جديد؟')) {
                clearProgress();
                
                // Reset to landing page
                landingPage.style.display = 'block';
                courseOverview.style.display = 'none';
                courseContainer.style.display = 'none';
                pageDisplay.style.display = 'none';
                completionMessage.style.display = 'none';
                
                // Hide navbar on landing page
                updateNavbarVisibility('landing');
                
                updateProgressUI();
                saveProgress();
            }
        });
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Only add keyboard navigation when we're viewing a page
        if (pageDisplay.style.display !== 'none') {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                
                if (e.key === 'ArrowLeft' && prevPageBtn && !prevPageBtn.disabled) {
                    prevPageBtn.click();
                } else if (e.key === 'ArrowRight' && nextPageBtn) {
                    nextPageBtn.click();
                }
            }
        }
    });

    // Load saved progress when page loads
    restoreProgress();
    
    // Set initial navbar visibility based on current page
    const savedProgress = loadProgress();
    if (!savedProgress.section || savedProgress.section === 'landing') {
        updateNavbarVisibility('landing');
    }
});

// --- Additional Navigation Functions ---

// Function to handle page navigation from within page content
function navigatePage(direction) {
    if (direction === 'previous') {
        if (document.getElementById('prev-page-btn')) {
            document.getElementById('prev-page-btn').click();
        }
    } else if (direction === 'next') {
        if (document.getElementById('next-page-btn')) {
            document.getElementById('next-page-btn').click();
        }
    }
}

// Function to go to previous section from completion page
function goToPreviousSection() {
    const completionMessage = document.getElementById('completion-message');
    const courseContainer = document.getElementById('course-container');
    
    if (completionMessage) {
        completionMessage.style.display = 'none';
    }
    
    if (courseContainer) {
        courseContainer.style.display = 'block';
    }
    
    // Show navbar when going back to course
    updateNavbarVisibility('units');
}

// Function to go to home page
function goToHome() {
    const landingPage = document.getElementById('landing-page');
    const courseOverview = document.getElementById('course-overview');
    const courseContainer = document.getElementById('course-container');
    const pageDisplay = document.getElementById('page-display');
    const completionMessage = document.getElementById('completion-message');
    
    // Hide all sections
    if (courseOverview) courseOverview.style.display = 'none';
    if (courseContainer) courseContainer.style.display = 'none';
    if (pageDisplay) pageDisplay.style.display = 'none';
    if (completionMessage) completionMessage.style.display = 'none';
    
    // Show landing page
    if (landingPage) {
        landingPage.style.display = 'block';
    }
    
    // Clear navigation state (no active nav links for landing page)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Hide navbar on landing page
    updateNavbarVisibility('landing');
    
    // Scroll to top
    window.scrollTo(0, 0);
}
