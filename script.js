const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.goto('http://www.amazon.es');


  // Interactuar con la barra de busqueda
  await page.type('#twotabsearchtextbox', 'libros de javascript');
  // Hacer el click lueggo de poner el input
  await page.click('.nav-search-submit input');
  // Espera hasta que la pagina cargue ese componente en especifico
  await page.waitForSelector('[data-component-type=s-search-result]')
  // Podemos hacer screen de la page
  // await page.screenshot({path:'prueba.jpg'})
  // Tiempo de esperas 
  await page.waitFor(1000)

  const enlaces = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-component-type=s-search-result] h2 a ')
    const links = []
    for (let element of elements) {
      links.push(element.href) 
    }
    return links
  })
  // console.log(enlaces);


  const books = []
  for (let enlace of enlaces) {

    await page.goto(enlace)
    await page.waitForSelector('#productTitle')
    

   const book =  await page.evaluate(() => {
      const tmp = {}
      tmp.title = document.querySelector('#productTitle').innerText;
      tmp.author = document.querySelector('.author a').innerText;
      // tmp.price = document.querySelector('.offer-price').innerText;
      return tmp
    })
    books.push(book)
  }

  // console.log(books)
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(books)
  xlsx.utils.book_append_sheet(wb,ws)
  xlsx.writeFile(wb, "books.xlsx")
  await browser.close()
  // return books;
})();

