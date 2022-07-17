let clearButton = document.getElementById('clear');
clearButton.addEventListener('click', () => {
    const bookmarks = document.getElementById('bookmarks').children
    for (let i = 0; i < bookmarks.length; i++) {
        bookmarks[i].remove();
    }
    alert('hi')
    chrome.storage.sync.clear()     
})

// fetch and display all existing bookmarks
chrome.storage.sync.get(null, (items) => {
    const bookmarks = document.getElementById("bookmarks")
    for (const [name, num] of Object.entries(items)) {
        const newNode = document.createElement("li")
        const textnode = document.createTextNode(name + " " + num);
        newNode.appendChild(textnode);
        bookmarks.appendChild(newNode)
    }
})
// handle new bookmark added by user
chrome.storage.onChanged.addListener(function (changes) {
    for (let [key, { newValue }] of Object.entries(changes)) {
      const bookmarkName = key;
      const pageNumber = newValue;
      const newNode = document.createElement("li")
      const textnode = document.createTextNode(bookmarkName + " " + pageNumber);
      newNode.appendChild(textnode);
      document.getElementById("bookmarks").appendChild(newNode);
    }
  });

// helper function to make sure we reload a page only after the URL has been updated
function waitForTabLoad(loadingTabId) {
    return new Promise(function(resolve) {
      chrome.tabs.onUpdated.addListener(function _listener(tabId, info, tab) {
        if (loadingTabId == tabId && tab.status == 'complete') {
          chrome.tabs.onUpdated.removeListener(_listener);
          resolve();
        }
      });
    });
  }

let form = document.getElementById('form')
form.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = event.target.name.value;   
    const pageNumber =  event.target.num.value;
    // persist submitted bookmark data
    chrome.storage.sync.set({[name]: pageNumber})
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        const currUrl = tabs[0].url;
        const onPageAlready = /[0-9]+$/; 
        let newUrl;
        // already on a certain page number
        if (currUrl.match(onPageAlready)) {
            newUrl = currUrl.replace(onPageAlready, pageNumber)
        } else {
            newUrl = currUrl + '#page=' + pageNumber
        }
        chrome.tabs.update(tabs[0].id, {url: newUrl}).then((tab) => {
            // wait for tab status to say complete (otherwise we'll have the old URL)
            waitForTabLoad(tab.id).then(() => {
                chrome.tabs.reload(tab.id)
            })
        });
  });
    // chrome.storage.sync.set({'bookmark': bookmark, 'pageNumber': pageNumber})
    // chrome.storage.sync.get('pageNumber', ({pageNumber}) => {
    //     chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
    //         chrome.tabs.update(tab[0].id, {url: tab[0].url + '#page=' + pageNumber}, () => chrome.tabs.reload());
    //   });

    // })
})
