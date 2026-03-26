/**
 * VidSrc.to Provider for PrometheusTV
 * Movie: https://vidsrc.to/embed/movie/{imdb_id}
 * TV:    https://vidsrc.to/embed/tv/{imdb_id}/{season}/{episode}
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
        embedUrl = "https://vidsrc.to/embed/movie/" + imdbid;
      } else {
        embedUrl =
          "https://vidsrc.to/embed/tv/" + imdbid + "/" + season + "/" + episode;
      }

      return [
        {
          name: "VidSrc.to",
          title: "▶ VidSrc.to",
          externalUrl: embedUrl,
          behaviorHints: {
            notWebReady: true,
            bingeGroup: "vidsrcto",
          },
        },
      ];
    });
}

module.exports = { getStreams };
