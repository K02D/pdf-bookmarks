
function waitForTabLoad(loadingTabId) {
    // when first loading a tab, the listener does not fire the callback
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
    const bookmark = event.target.name.value;
    const pageNumber =  event.target.num.value;
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        const currUrl = tabs[0].url;
        const onPageAlready = /[0-9]+$/; 
        let newUrl;
        if (currUrl.match(onPageAlready)) {
            newUrl = currUrl.replace(onPageAlready, pageNumber)
        } else {
            newUrl = currUrl + '#page=' + pageNumber
        }
        chrome.tabs.update(tabs[0].id, {url: newUrl}).then((tab) => {
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
