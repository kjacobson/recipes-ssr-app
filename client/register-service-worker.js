navigator.serviceWorker && navigator.serviceWorker.register('./public/sw.js', { scope : '/' }).then((registration) => {
    console.log('Service worker registered with scope: ', registration.scope);
}).catch(err => {
    console.error('Error installing service worker: ', err);
});

const listenForMessages = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.etag && localStorage && localStorage.getItem('indexETag') !== message.etag) {
                console.log(message.url + " has changed");
                localStorage.setItem('indexETag', message.etag);

                if (message.type === 'refresh') {
                    document.body.classList.add('update-available');
                } else
                if (message.type === 'force-refresh') {
                    window.reload();
                }
            }
        };
    }
}
