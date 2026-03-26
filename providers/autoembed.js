/**
 * AutoEmbed Provider for PrometheusTV
 * Movie: https://autoembed.cc/embed/movie/{tmdb_id}
 * TV:    https://autoembed.cc/embed/tv/{tmdb_id}-{season}-{episode}
 * Note: Accepts TMDB ID directly — no IMDb lookup needed
 */

function getStreams(tmdbid, mediatype, season, episode) {
  var embedUrl;
  if (mediatype === "movie") {
    embedUrl = "https://autoembed.cc/embed/movie/" + tmdbid;
  } else {
    embedUrl =
      "https://autoembed.cc/embed/tv/" +
      tmdbid +
      "-" +
      season +
      "-" +
      episode;
  }

  return Promise.resolve([
    {
      name: "AutoEmbed",
      title: "▶ AutoEmbed",
      externalUrl: embedUrl,
      behaviorHints: {
        notWebReady: true,
        bingeGroup: "autoembed",
      },
    },
  ]);
}

module.exports = { getStreams };
