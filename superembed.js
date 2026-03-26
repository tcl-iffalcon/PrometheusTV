/**
 * SuperEmbed Provider for PrometheusTV
 * Movie: https://multiembed.mov/directstream.php?video_id={imdb_id}&tmdb=1
 * TV:    https://multiembed.mov/directstream.php?video_id={imdb_id}&tmdb=1&s={season}&e={episode}
 * Note: multiembed.mov is the SuperEmbed backend
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
        embedUrl =
          "https://multiembed.mov/directstream.php?video_id=" +
          imdbid +
          "&tmdb=1";
      } else {
        embedUrl =
          "https://multiembed.mov/directstream.php?video_id=" +
          imdbid +
          "&tmdb=1&s=" +
          season +
          "&e=" +
          episode;
      }

      return [
        {
          name: "SuperEmbed",
          title: "▶ SuperEmbed",
          externalUrl: embedUrl,
          behaviorHints: {
            notWebReady: true,
            bingeGroup: "superembed",
          },
        },
      ];
    });
}

module.exports = { getStreams };
