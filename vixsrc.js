/**
 * VixSrc Provider for PrometheusTV
 * Movie: https://vixsrc.to/embed/movie/{tmdb_id}
 * TV:    https://vixsrc.to/embed/tv/{tmdb_id}/{season}/{episode}
 * Note: Accepts TMDB ID directly — no IMDb lookup needed
 */

function getStreams(tmdbid, mediatype, season, episode) {
  var embedUrl;
  if (mediatype === "movie") {
    embedUrl = "https://vixsrc.to/embed/movie/" + tmdbid;
  } else {
    embedUrl =
      "https://vixsrc.to/embed/tv/" + tmdbid + "/" + season + "/" + episode;
  }

  return Promise.resolve([
    {
      name: "VixSrc",
      title: "▶ VixSrc",
      externalUrl: embedUrl,
      behaviorHints: {
        notWebReady: true,
        bingeGroup: "vixsrc",
      },
    },
  ]);
}

module.exports = { getStreams };
