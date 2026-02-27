/**
 * Sinewix Provider for Nuvio TV
 * sinewix.onrender.com Stremio API'sini kullanır
 */

var BASE_URL = "https://sinewix.onrender.com";

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Sinewix] Fetching:", mediaType, tmdbId, season, episode);

  var tmdbType = mediaType === "movie" ? "movie" : "tv";
  var tmdbUrl = "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "/external_ids?api_key=4ef0d7355d9ffb5151e987764708ce96";

  return fetch(tmdbUrl)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var imdbId = data.imdb_id;
      if (!imdbId) {
        console.log("[Sinewix] No IMDb ID found for TMDB:", tmdbId);
        return fetchStreams("tmdb:" + tmdbId, mediaType, season, episode);
      }
      console.log("[Sinewix] IMDb ID:", imdbId);
      return fetchStreams(imdbId, mediaType, season, episode);
    })
    .catch(function(err) {
      console.error("[Sinewix] TMDB error:", err.message);
      return fetchStreams("tmdb:" + tmdbId, mediaType, season, episode);
    });
}

function fetchStreams(stremioId, mediaType, season, episode) {
  var streamUrl;

  if (mediaType === "movie") {
    streamUrl = BASE_URL + "/stream/movie/" + stremioId + ".json";
  } else {
    streamUrl = BASE_URL + "/stream/series/" + stremioId + ":" + season + ":" + episode + ".json";
  }

  console.log("[Sinewix] Stream URL:", streamUrl);

  return fetch(streamUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data || !data.streams || data.streams.length === 0) {
        console.log("[Sinewix] No streams found");
        return [];
      }

      console.log("[Sinewix] Found", data.streams.length, "streams");

      return data.streams.map(function(s) {
        return {
          name: "Sinewix",
          title: s.title || s.name || "Sinewix Stream",
          url: s.url,
          quality: s.quality || "HD",
          headers: s.behaviorHints && s.behaviorHints.headers ? s.behaviorHints.headers : {
            "Referer": BASE_URL,
            "User-Agent": "Mozilla/5.0"
          }
        };
      }).filter(function(s) { return s.url; });
    })
    .catch(function(err) {
      console.error("[Sinewix] Stream fetch error:", err.message);
      return [];
    });
}
module.exports = { getStreams };
