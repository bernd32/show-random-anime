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
  Чтобы проверить существует ли аниме по сгенерированному id, мы 
  проверяем по этому id служебную ajax-страничку, которая весит 
  всего около 1кб. К сожалению, ajax-страничка не содержит все нужные 
  для нас данные, а поэтому годится только для проверки действительности 
  id. Таким образом мы не нагружаем сервер MAL и делаем повторный 
  поиск более быстрым.  
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

      // Айди правильное, поэтому перераписываем переменную с html-данными
      // на html-данные основной страницы с аниме
      const mainPage = `${BASE_URL}/anime/${id}`;
      const dataFromMainPage = await axios.get(mainPage, axiosConfig);
      console.log(`await axios.get(${mainPage}, axiosConfig);`);
      // Скрейпим нужные нам данные и возвращаем их 
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

function setSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Добавляется 'l' перед '.jpg' в полученной ссылки на картинку, 
// чтобы получить ссылку на увеличенную версию. 
function largeImgSrc(src) {
  const largeImgSrc = src.slice(0, -4) + 'l' + src.slice(-4);
  return largeImgSrc;
}

exports.scrapeData = scrapeData;