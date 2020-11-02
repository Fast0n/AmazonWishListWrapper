const express = require("express");
const app = express();
const request = require("request");
const cheerio = require("cheerio");

const PORT = 1337;
console.log("port: " + PORT);
console.log("-----");

var price = [];
var title = [];
var image = [];
var url = [];

app.get("/", (req, res) => {
  res.status(200).send("Benvenuto in AmazonWishListWrapper!");
});

app.get("/get", function (req, res) {
  var options = {
    uri: req.query.url,
    method: "GET",
  };

  request(options, function (error, response, body) {
    try {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var name_wish_list = $("#profile-list-name").html();
        var number_list = $("#viewItemCount").val();
        var a = cheerio.load($("#g-items").html());

        var Region_URL = req.query.url.split("/").slice(0, 3).join("/");
        // Prende i titoli degli articoli
        a("h3 a").each(function (index, element) {
          title.push($(element).attr("title"));
          url.push(Region_URL + $(element).attr("href"));
        });

        // Prende il prezzo degli articoli
        a("li").each(function (index, element) {
          if ($(element).attr("data-price") != "-Infinity")
            price.push(Number($(element).attr("data-price")));
          else price.push(0);
        });

        // Prende l'immagine
        a("img").each(function (index, element) {
          image.push($(element).attr("src"));
        });
        var data_store = [];
        data_store[0] = {};
        data_store[0]["name_wish_list"] = name_wish_list;
        data_store[0]["number_list"] = number_list;
        data_store[0]["total_price"] = eval(price.join("+")).toFixed(2);

        // show date
        for (var i = 1; i < title.length + 1; i++) {
          data_store[i] = {};

          data_store[i]["title"] = title[i - 1];
          data_store[i]["price"] = price[i - 1];
          data_store[i]["image"] = image[i - 1];
          data_store[i]["url"] = url[i - 1];
        }
        res.send(data_store);

        price = [];
        title = [];
        image = [];
        url = [];
      }
    } catch (error) {
      res.status(404).send("Link errato");
    }
  });
});

const server = app.listen(process.env.PORT || PORT, function () {});
