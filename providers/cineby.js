/**
 * Cineby Provider for PrometheusTV
 * Embed URL pattern:
 *   Movie: https://www.cineby.gd/movie/{imdb_id}
 *   TV:    https://www.cineby.gd/tv/{imdb_id}/{season}/{episode}
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
        embedUrl = "https://www.cineby.gd/movie/" + imdbid;
      } else {
        embedUrl =
          "https://www.cineby.gd/tv/" + imdbid + "/" + season + "/" + episode;
      }

      return [
        {
          name: "Cineby",
          title: "▶ Cineby",
          url: embedUrl,
          behaviorHints: {
            notWebReady: false,
            bingeGroup: "cineby",
          },
        },
      ];
    });
}

module.exports = { getStreams };
