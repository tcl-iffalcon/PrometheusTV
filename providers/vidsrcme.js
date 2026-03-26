/**
 * VidSrc.me Provider for PrometheusTV
 * Movie: https://vidsrc.me/embed/movie?imdb={imdb_id}
 * TV:    https://vidsrc.me/embed/tv?imdb={imdb_id}&season={s}&episode={e}
 */

function getStreams(tmdbid, mediatype, season, episode) {
  var tmdbtype = mediatype === "movie" ? "movie" : "tv";
  var tmdburl =
    "https://api.themoviedb.org/3/" +
    tmdbtype +
    "/" +
    tmdbid +
    "?language=tr-TR&api_key=4ef0d7355d9ffb5151e987764708ce96";

  return fetch(tmdburl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var imdbid = data.imdb_id || "";
      if (!imdbid) return [];

      var embedUrl;
      if (mediatype === "movie") {
        embedUrl = "https://vidsrc.me/embed/movie?imdb=" + imdbid;
      } else {
        embedUrl =
          "https://vidsrc.me/embed/tv?imdb=" +
          imdbid +
          "&season=" +
          season +
          "&episode=" +
          episode;
      }

      return [
        {
          name: "VidSrc.me",
          title: "▶ VidSrc.me",
          externalUrl: embedUrl,
          behaviorHints: {
            notWebReady: true,
            bingeGroup: "vidsrcme",
          },
        },
      ];
    });
}

module.exports = { getStreams };
