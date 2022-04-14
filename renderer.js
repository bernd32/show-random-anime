/*
This script is interacting with the web contents, calling scrapeData() from
scrapper.js, getting and displaying returned data from it
*/

const scrapper = require('./scrapper');

const aired = document.querySelector('#aired'),
      score = document.querySelector('#score'),
      title = document.querySelector('#anime_title'),
      url = document.querySelector('#url'),
      synopsis = document.querySelector('#synopsis'),
      poster = document.querySelector('#poster'),
      btnFind = document.querySelector('#find_btn'),
      infoSection = document.querySelector('#info');

infoSection.hidden = true;

btnFind.addEventListener('click', () => {
      let t0 = performance.now();
      whileLoading();
      scrapper.scrapeData().then((data) => {
            let t1 = performance.now();
            poster.setAttribute('src', data.img);
            aired.innerHTML = data.aired;
            score.innerHTML = data.score;
            title.innerHTML = data.title;
            url.innerHTML = `<a href=${data.url}>${data.url}</a>`;
            synopsis.innerHTML = data.synopsis.replace('[Written by MAL Rewrite]', '<i>[Written by MAL Rewrite]</i>');
            afterLoaded(data.retries, Math.round((t1 - t0) / 1000));
            btnFind.setAttribute('value', 'Find next');
      });

});

function whileLoading() {
      infoSection.hidden = true;
      infoSection.insertAdjacentHTML('beforebegin', '<p class="loader"></p>');
      btnFind.disabled = true;
}

function afterLoaded(retries, loadedTime) {
      infoSection.hidden = false;
      document.querySelector('.loader')
            .parentNode.removeChild(document.querySelector('.loader'));
      document.querySelector('#loaded')
            .textContent = `Found anime after ${retries} retry(-es)! 
            Time elapsed: ${loadedTime} seconds`;
      btnFind.disabled = false;
}