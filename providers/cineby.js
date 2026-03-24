// Cineby Provider for PrometheusTV
// Embed URL pattern:
//   Movie: https://www.cineby.gd/movie/{imdb_id}
//   TV:    https://www.cineby.gd/tv/{imdb_id}/{season}/{episode}

var cinebyProvider = {
  name: "Cineby",
  timeout: 10000,

  getStreams: function (imdbId, type, season, episode) {
    return new Promise(function (resolve) {
      var embedUrl;

      if (type === "movie") {
        embedUrl = "https://www.cineby.gd/movie/" + imdbId;
      } else {
        embedUrl =
          "https://www.cineby.gd/tv/" +
          imdbId +
          "/" +
          season +
          "/" +
          episode;
      }

      resolve([
        {
          name: "Cineby",
          title: "▶ Cineby",
          url: embedUrl,
          behaviorHints: {
            notWebReady: false,
            bingeGroup: "cineby",
          },
        },
      ]);
    });
  },
};

module.exports = cinebyProvider;
