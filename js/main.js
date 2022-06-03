//html elements for darkMode
const elBody = document.querySelector("body");
const elDarkMode = document.querySelector("#dark-mode");

//html template elements
const elBookTemplate = document.querySelector("#book-template").content;
const elBookmarkTemplate = document.querySelector("#bookmark-template").content;

//html wrappers
const elBookWrapper = document.querySelector("#book-wrapper");
const elBookmarkWrapper = document.querySelector("#bookmark-wrapper");

//html extra elements
const elSearchResult = document.querySelector("#main-result");
const elOrderBook = document.querySelector("#main-order");
const elReadBtn = document.querySelector("#read-btn");
const elCanvas = document.querySelector("#offcanvasRight");

//html form elements
const elForm = document.querySelector("#main-form");
const elInput = document.querySelector("#main-input");

//darkMode added
elDarkMode.addEventListener("click", function (evt) {
    elBody.classList.toggle("dark-mode");
});

//called API from elFrom
elForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    
    let inputValue = elInput.value.trim();
    
    ;(async function () {
        let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${inputValue}`);
        let result = await responce.json();
        
        renderBooks(result.items, elBookWrapper);
    })();
    
    elInput.value = null;
});

//render  Books
function renderBooks(array, node) {
    node.innerHTML = null;
    let bookFragment = document.createDocumentFragment();
    
    array.forEach(item => {
        let bookTemplate = elBookTemplate.cloneNode(true);
        
        bookTemplate.querySelector("#book-img").src = item.volumeInfo.imageLinks.thumbnail;
        bookTemplate.querySelector("#book-name").textContent = item.volumeInfo.title;
        bookTemplate.querySelector("#book-author").textContent = item.volumeInfo.authors;
        bookTemplate.querySelector("#book-year").textContent = item.volumeInfo.publishedDate;
        bookTemplate.querySelector("#bookmark-btn").dataset.bookmarkId = item.id;
        bookTemplate.querySelector("#modal-info").dataset.canvasId = item.id;
        bookTemplate.querySelector("#read-btn").href = item.volumeInfo.previewLink;
        
        bookFragment.appendChild(bookTemplate);
    });
    
    let lengthOfBooks = array.length;
    
    elSearchResult.textContent = lengthOfBooks
    
    node.appendChild(bookFragment);
};

//add Canvas
elBookWrapper.addEventListener("click", function (evt) {
    let canvasID = evt.target.dataset.canvasId;
    
    if (canvasID) {
        ;(async function () {
            let responce = await fetch (`https://www.googleapis.com/books/v1/volumes/${canvasID}`);
            let date = await responce.json();
            
            let canvasArray = [];
            canvasArray.push(date);
            
            canvasArray.forEach(item => {
                elCanvas.querySelector(".modal-name").textContent  = item.volumeInfo.title;
                elCanvas.querySelector("#modal-img").src = item.volumeInfo.imageLinks.smallThumbnail;
                elCanvas.querySelector("#modal-summary").textContent = item.volumeInfo.description;
                
                elCanvas.querySelector("#modal-author").textContent = item.volumeInfo.authors;
                elCanvas.querySelector("#modal-published").textContent = item.volumeInfo.publishedDate;
                elCanvas.querySelector("#modal-publishers").textContent = item.volumeInfo.publisher;
                elCanvas.querySelector("#modal-categories").textContent = item.volumeInfo.categories;
                elCanvas.querySelector("#modal-page").textContent = item.volumeInfo.pageCount;
                elCanvas.querySelector("#read-btn").href = item.volumeInfo.previewLink;
                
            })
            canvasArray = null;
        })();
    }
});

//called API from Bookmark btn
async function fetchBookmarks(item) {
    let responce = await fetch(`https://www.googleapis.com/books/v1/volumes/${item}`);
    let date = await responce.json()
    
    return date
}

let storage = window.localStorage;

let getBookmark = JSON.parse(storage.getItem("bookArray"))

let bookmarkedBooks = getBookmark || []

//bookmark btn working
elBookWrapper.addEventListener("click", async function (evt) {
    let foundBookId = evt.target.dataset.bookmarkId
    
    
    if (foundBookId) {
        let date = await fetchBookmarks(foundBookId)
        
        let dateArray = []
        dateArray.push(date)
        
        let foundBook = dateArray.find(item => item.id == foundBookId)
        
        let doesInclude = bookmarkedBooks.findIndex(item => item.id === foundBook.id)
        
        if (doesInclude === -1) {
            bookmarkedBooks.unshift(foundBook)
            
            storage.setItem("bookArray", JSON.stringify(bookmarkedBooks))
            
            renderBookmarks(bookmarkedBooks, elBookmarkWrapper)
        }
    }
})

//render bookmarks
function renderBookmarks(array, node) {
    node.innerHTML = null
    let bookmarkFragment = document.createDocumentFragment()
    
    array.forEach(item => {
        let bookmarkTemplate = elBookmarkTemplate.cloneNode(true);
        
        bookmarkTemplate.querySelector("#bookmark-name").textContent = item.volumeInfo.title;
        bookmarkTemplate.querySelector("#bookmark-author").textContent = item.volumeInfo.authors;
        bookmarkTemplate.querySelector("#read-btn").href = item.volumeInfo.previewLink;
        bookmarkTemplate.querySelector("#remove-btn").dataset.bookRemoveId = item.id;
        
        bookmarkFragment.appendChild(bookmarkTemplate)
    })
    
    node.appendChild(bookmarkFragment)
}

//remove bookmark
elBookmarkWrapper.addEventListener("click", function (evt) {
    let removeID = evt.target.dataset.bookRemoveId
    
    if (removeID) {
        let indexOfBooks = bookmarkedBooks.find(item => item.id == removeID)
        
        bookmarkedBooks.splice(indexOfBooks, 1)
        
        storage.setItem("bookArray", JSON.stringify(bookmarkedBooks))
        
        renderBookmarks(bookmarkedBooks, elBookmarkWrapper)
    }
    
})