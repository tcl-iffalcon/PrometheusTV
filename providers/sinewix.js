/**
 * sinewix - Built from src/sinewix/
 * Generated: 2026-03-12T17:37:02.910Z
 */

// src/sinewix/index.js
var base_url = "https://ydfvfdizipanel.ru";
var token = "9iQNC5HQwPlaFuJDkhncJ5XTJ8feGXOJatAA";
var headers = {
  "accept": "application/json",
  "accept-encoding": "gzip",
  "user-agent": "okhttp/5.0.0-alpha.6",
  "packagename": "com.sinewix",
  "signature": "308202c3308201aba0030201020204075cec01300d06092a864886f70d01010b050030123110300e0603550403130753696e65776978301e170d3231303932313233333334395a170d3436303931353233333334395a30123110300e0603550403130753696e6577697830820122300d06092a864886f70d01010105000382010f003082010a0282010100b0a2a1bc5c3f16f19c3b2456cfd0a6128ced9f5e2e2c4cca1a100e17b07b86256258f372e76a95a17e9e4a1c048e364835723a95e8ef6d5bdfb5694b50277c65a64f7b012fdf164e5dc93629561f6ca29b7dc82ebb3d6f3c8e8fc6795847fe331ad4a13ed6c059a83804c43d3747526d769580f3a4153752eb22dac66dd15f1582caa43305dc49f55ac7b1b89013e654d2ca8c94c30956659674cc673256c04208f09118bae14cdd72d78f9ee2aece958084a8c2e315deff45726d4fc1f18ec39569ff1abe4f36a8d01090e5f68c07c28763513b88208bcac1a6e1941f6fd8bfdd52f832098ddb2154c8f565bc5d58c7106a19e03787e75c7f34997000e3bcf30203010001a321301f301d0603551d0e04160414b545fc18e74a791d9402b53940ae38b96e9e209c300d06092a864886f70d01010b05000382010100a8a64d9e7c8b5db102af15d3caf94ff8d3e9be9008bb0021117ca2f0762e68583354b126a041bb1fb6e6308e421e4b5a71f779cde63e5d2fc5976bff966c3c4034e852c077d8e74458fbae2ec1db74b1f4082e188bf8ef7c42a44e3fbfb693bb00ee2a727096b42360ddce1bdcd3536f50c8693bcc62a7b7204bcefe2ecf1f7c820bcd63e1d7a6acc8bf6163086915fc5f607cf51bc7a8635f98bb4c65a8f24b7b5a82c7b06868f565cb0d6ac4775c4aac777536ddd1a565f990fd8cbe539185fa7aab610b7855a687a00f4e55536d72873444552c50fd10727dbf298a9be6ed6ae62148dd1de365f3729915dd31975e28a472d752ac14db3db548405cc31e1e",
  "hash256": "f4d4bc98a3fc4600e7f2c2bab7533f1f03d8a70ff03c256bb11dc57050536bd0"
};
function apicall(path) {
  return fetch(base_url + "/public/api" + path + "/" + token, { headers }).then(function(res) {
    return res.json();
  });
}
function getStreams(tmdbid, mediatype, season, episode) {
  var tmdbtype = mediatype === "movie" ? "movie" : "tv";
  var tmdburl = "https://api.themoviedb.org/3/" + tmdbtype + "/" + tmdbid + "?language=tr-TR&api_key=4ef0d7355d9ffb5151e987764708ce96";
  return fetch(tmdburl).then(function(res) {
    return res.json();
  }).then(function(data) {
    var title = data.title || data.name || "";
    if (!title)
      return [];
    return searchAndStream(title, mediatype, season, episode);
  });
}
function searchAndStream(title, mediatype, season, episode) {
  return apicall("/search/" + encodeURIComponent(title.toUpperCase())).then(function(data) {
    if (!data || !data.search || data.search.length === 0)
      return [];
    var contentid = data.search[0].id;
    return fetchStreams(contentid, mediatype, season, episode);
  });
}
function fetchStreams(contentid, mediatype, season, episode) {
  return apicall("/media/detail/" + contentid).then(function(data) {
    var videos = data.videos || [];
    if (mediatype !== "movie") {
      videos = videos.filter(function(v) {
        return v.season == season && v.episode == episode;
      });
    }
    return videos.map(function(v) {
      return {
        name: "Sinewix",
        title: "Sinewix",
        url: v.url || v.link,
        quality: v.label || "HD",
        headers
      };
    }).filter(function(s) {
      return s.url;
    });
  });
}
module.exports = { getStreams };
