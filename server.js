const express = require("express");
const app = express();
var axios = require('axios');
const cheerio = require("cheerio");

const PORT = 1337;
console.log("port: " + PORT);
console.log("-----");

var price = [];
var title = [];
var image = [];
var url = [];

var npid = require('npid');



try {
  var pid = npid.create('/tmp/AmazonWishListWrapper.pid');
  pid.removeOnExit();
} catch (err) {
  console.log(err);
  process.exit(1);
}


app.get("/", (req, res) => {
  res.status(200).send("Benvenuto in AmazonWishListWrapper!");
});

app.get("/get", function (req, res) {

  var options = {
    method: 'get',
    url: req.query.url
  };

  axios(options)
    .then(function (response) {
      try {
        var $ = cheerio.load(response.data);
        var name_wish_list = $("#profile-list-name").html();
        var number_list = $("#viewItemCount").val();
        var a = cheerio.load($("#g-items").html());


        var Region_URL = req.query.url.split("/").slice(0, 3).join("/");
        // Prende i titoli degli articoli
        a("h2 a").each(function (index, element) {
          title.push($(element).attr("title"));
          url.push(Region_URL + $(element).attr("href"));
        });

        // Prende il prezzo degli articoli
        a("li").each(function (index, element) {
          if ($(element).attr("data-price") != "-Infinity" && $(element).attr("data-price") != undefined) {
            price.push(Number($(element).attr("data-price")));

          } else price.push(0);
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
        for (var i = 1; i < number_list; i++) {
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
      } catch (error) {
        var data_store = [];
        data_store[0] = {};
        data_store[0]["error"] = "Link Errato";
        res.send(data_store);

        res.status(404).send(data_store);
      }

    })
    .catch(function (error) {

      console.log(error);

    });

});

const server = app.listen(process.env.PORT || PORT, function () {});