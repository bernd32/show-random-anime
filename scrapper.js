/*
This script is searching for a random anime by performing GET requests 
with axios, getting html data, and then pulling needed data from
the resulting data structure with cheerio library
*/

const cheerio = require('cheerio');
const axios = require('axios');

let retries = 0;

async function scrapeData() {

  const retryTimeout = 1000;
  const axiosConfig = {
    credentials: 'same-origin',
    timeout: 8000
  };

  const BASE_URL = 'https://myanimelist.net';
  /*
  To check if an anime exists based on a randomly generated id, we use an ajax
  page that weighs only about 1kb. Unfortunately, the ajax page doesn't contain 
  all the data we need, so it's only good for checking the id's validity. 
  This way we don't overload the MAL servers and making the search faster.  
  */
  let id = Math.floor(Math.random() * 44000);
  const url = `${BASE_URL}/includes/ajax.inc.php?t=64&id=${id}`;
  try {
    const {
      data
    } = await axios.get(url, axiosConfig);

    if (data.length > 29) {
      console.log('Anime found, scraping the main page... ID: ' + id);
      console.log('Reries: ' + retries);


      const mainPage = `${BASE_URL}/anime/${id}`;
      const dataFromMainPage = await axios.get(mainPage, axiosConfig);
      console.log(`await axios.get(${mainPage}, axiosConfig);`);

      const $ = cheerio.load(dataFromMainPage.data);
      const title =
        $('.title-name > strong:nth-child(1)')
        .text();
      const imgSrc =
        $('div.leftside div a img.lazyload')
        .attr('data-src');
      const synopsis =
        $('p[itemprop=description]')
        .text();
      const score =
        $('div.fl-l.score div')
        .text();
      let aired =
        $('div.leftside div.spaceit_pad:contains("Aired:")');
      aired.find('span').remove();
      aired = aired.text().trim();

      const scrapedData = {
        title: title,
        img: largeImgSrc(imgSrc),
        url: mainPage,
        synopsis: synopsis,
        score: score,
        aired: aired,
        retries: retries
      };
      retries = 0;

      return scrapedData;

    } else {
      console.log('Anime not found, searching again... ID: ' + id);
      retries += 1;
      console.log('Retry #' + retries);
      await setSleep(retryTimeout);
      return await scrapeData();
    }
  } catch (e) {
    console.warn(e.name === "AbortError" ? "Promise Aborted" : "Promise Rejected");
  }

}

// setting timeout between searches to not abuse the MAL servers
function setSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// adding 'l' before '.jpg' to get full-size image src
function largeImgSrc(src) {
  const largeImgSrc = src.slice(0, -4) + 'l' + src.slice(-4);
  return largeImgSrc;
}

exports.scrapeData = scrapeData;