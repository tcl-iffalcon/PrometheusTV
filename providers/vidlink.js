/**
 * Vidlink Provider for PrometheusTV
 * Movie: https://vidlink.pro/movie/{tmdb_id}
 * TV:    https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}
 * Note: Accepts TMDB ID directly — no IMDb lookup needed
 */

function getStreams(tmdbid, mediatype, season, episode) {
  var embedUrl;
  if (mediatype === "movie") {
    embedUrl = "https://vidlink.pro/movie/" + tmdbid;
  } else {
    embedUrl =
      "https://vidlink.pro/tv/" + tmdbid + "/" + season + "/" + episode;
  }

  return Promise.resolve([
    {
      name: "Vidlink",
      title: "▶ Vidlink",
      externalUrl: embedUrl,
      behaviorHints: {
        notWebReady: true,
        bingeGroup: "vidlink",
      },
    },
  ]);
}

module.exports = { getStreams };
