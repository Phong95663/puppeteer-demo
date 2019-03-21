const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Grammar = require('./model');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 250, args: ['--start-fullscreen'] });
  // const browser = await puppeteer.launch({ slowMo: 250 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 2400 });
  await page.goto('http://mazii.net/#!/search');
  await page.click('#tab3');
  const pageSize = 185;
  for (let i = 0; i < pageSize; i++) {
    console.log(`Page: ${i}`);
    await getData(page);
    await page.waitFor(2000);
    await page.click('div.box-pagination>ul>li:nth-child(8)');
  }
  await browser.close();

})();

const getData = async (page) => {
  for (let i = 1; i < 13; i++) {
    try {
      await page.waitForSelector(`.box-card:nth-child(${i})`);
      console.log(i);
      await page.click(`.box-card:nth-child(${i})`);
      await page.waitForSelector('.grammar-item-title');
      await page.waitForSelector('.close-modal-jlpt');
      const grammar = await page.evaluate(() => {
        const title = document.querySelector('.grammar-item-title').textContent;
        const mean = document.querySelector('.grammar-item-title-mean').textContent;
        let use = '';
        if (document.querySelector('.gr-use-syn-item') != null) {
          use += document.querySelector('.gr-use-syn-item').textContent;
        }
        const explain = document.querySelector('.gr-explain-note').textContent;
        const examples = [];
        const examples_ele = document.querySelectorAll('.japanese-char');
        const examples_mean = document.querySelectorAll('.example-mean-word');
        const count_example = examples_ele.length;
        for (let i = 0; i < count_example; i++) {
          let count_child_ja = examples_ele[i].children.length;
          let ex_ja = '';
          if (examples_ele[i].hasAttribute('ng-bind-html')) {
            ex_ja = examples_ele[i].textContent.trim();
          }
          else {
            for (let j = 0; j < count_child_ja; j++) {
              ex_ja += examples_ele[i].children[j].firstChild.textContent.trim();
            }
          }
          let ex_vi = examples_mean[i].textContent.trim();
          examples.push({
            ja: ex_ja,
            vi: ex_vi
          })
        }
        document.querySelector('.close-modal-jlpt').click();
        return {
          title: title,
          mean: mean,
          use: use,
          explain: explain,
          examples: examples
        };
      });
      console.log(grammar);
      insert(grammar);
    } catch (error) {
      console.log(error);
    }
  }
}

let insert = (Obj) => {

  const DB_URL = 'mongodb://localhost:27017/puppeteer';

  if (mongoose.connection.readyState == 0) { mongoose.connect(DB_URL); }

  let conditions = { title: Obj.title };
  let options = { upsert: true, new: true, setDefaultsOnInsert: true };

  Grammar.findOneAndUpdate(conditions, Obj, options, (err, result) => {
    if (err) throw err;
  });
}

let convertTitle = async (str) => {
  const res = await kuroshiro.convert(str, { to: "katakana" });
  return res;
}
