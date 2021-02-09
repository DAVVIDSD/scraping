const puppeteer = require("puppeteer");
const xlsx = require("xlsx");
const inquirer = require("inquirer");
const Downloader = require("./donwloader");

(() => {
  //input
  inquirer
    .prompt({
      name: "search",
      message: "Ingresa tu busqueda",
    })
    .then(async (value) => {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto("https://www.mercadolibre.com.co/");
      // Interactuar con la barra de busqueda
      await page.type(".nav-search-input", `${value.search}`);
      // Hacer el click luego de poner el input
      await page.click(".nav-search-btn");
      // Espera hasta que la pagina cargue ese componente en especifico
      await page.waitForSelector(".ui-search-results");
      //Extraer links
      const enlaces = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          ".ui-search-item__group--title a"
        );
        const links = [];
        for (let element of elements) {
          links.push(element.href);
        }
        return links;
      });

      //Data final
      const finishData = [];
      // Recorrer cada producto
      for (let enlace of enlaces) {
        await page.goto(enlace);
        await page.waitForSelector(".ui-pdp-title");

        const data = await page.evaluate(() => {
          const tmp = {};
          tmp.title = document.querySelector(".ui-pdp-title").innerText;
          tmp.price = document.querySelector(".price-tag-fraction").innerText;
          tmp.description = document.querySelector(
            ".ui-pdp-description__content"
          ).innerText;
          const link = document.querySelector(".ui-pdp-image ").src;
          const replaces = link.replace("Q", "NQ");
          const newLink = replaces.replace("R", "O");
          const img = newLink.replace("webp", "jpg");
          tmp.img = img;
          return tmp;
        });
        finishData.push(data);
      }
      inquirer
        .prompt({
          name: "route",
          message: "Escriba la donde se guardaran las imagenes",
        })
        .then((value) => {
          for (values of finishData) {
            Downloader.download(values.img, value.route);
          }
          console.log('Imagenes guardadas con exito')
          inquirer
            .prompt({
              name: "routeFile",
              message: "Escriba la ruta de su archivo",
            })
            .then((value) => {
              const wb = xlsx.utils.book_new();
              const ws = xlsx.utils.json_to_sheet(finishData);
              xlsx.utils.book_append_sheet(wb, ws);
              xlsx.writeFile(wb, `${value.routeFile}.xlsx`);
              console.log('Archivo guardado con exito')
            });
        });
      await browser.close();
    });
})();
