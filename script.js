document.addEventListener('DOMContentLoaded', () => {
    // Page elements
    const landingPage = document.getElementById('landing-page');
    const courseOverview = document.getElementById('course-overview');
    const courseContainer = document.getElementById('course-container');
    const pageDisplay = document.getElementById('page-display');
    const pageContent = document.getElementById('page-content');
    const pageStorage = document.getElementById('page-storage');

    // Buttons
    const landingBtn = document.getElementById('landing-btn');
    const startBtn = document.getElementById('start-btn');
    const backToTitlesBtn = document.getElementById('back-to-titles');
    const nextPageBtn = document.getElementById('next-page-btn');
    
    // State variables
    let currentUnitId = null;
    let currentPageIndex = 0;
    let currentPages = [];

    // --- Initial Navigation ---

    landingBtn.addEventListener('click', () => {
        landingPage.style.display = 'none';
        courseOverview.style.display = 'block';
    });

    startBtn.addEventListener('click', () => {
        courseOverview.style.display = 'none';
        showUnitList();
    });
    
    // --- Core Logic ---

    function showUnitList() {
        courseContainer.style.display = 'block';
        pageDisplay.style.display = 'none';
        document.querySelectorAll('.page-list-container').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.unit').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.unit-header').forEach(el => el.style.display = 'flex');
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
    }
    
    function updatePageNavigation() {
        const pageCounter = document.getElementById('page-counter');
        pageCounter.textContent = `صفحة ${currentPageIndex + 1} من ${currentPages.length}`;
        
        if (currentPageIndex >= currentPages.length - 1) {
             nextPageBtn.textContent = 'العودة للوحدة';
        } else {
             nextPageBtn.textContent = 'الصفحة التالية';
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

    // 4. Navigation within a page (Back to Titles / Next Page)
    backToTitlesBtn.addEventListener('click', () => {
        pageDisplay.style.display = 'none';
        showUnitList();
        showPageList(currentUnitId);
    });

    nextPageBtn.addEventListener('click', () => {
        // Mark current page's checkbox as complete
        if (currentPageIndex < currentPages.length) {
            const completedPageId = currentPages[currentPageIndex].dataset.pageId;
            const checkbox = document.querySelector(`input[id="${completedPageId}-check"]`);
            if(checkbox) {
                checkbox.checked = true;
            }
        }

        // Move to next page or back to list
        currentPageIndex++;
        if (currentPageIndex < currentPages.length) {
            const nextPageId = currentPages[currentPageIndex].dataset.pageId;
            showPage(nextPageId);
        } else {
            // Finished all pages in the unit
            pageDisplay.style.display = 'none';
            showUnitList();
            showPageList(currentUnitId);
        }
    });
});
