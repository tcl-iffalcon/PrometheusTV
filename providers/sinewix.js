/**
 * Sinewix Provider for Nuvio TV
 * sinewix.onrender.com Stremio API'sini kullanır
 */

var BASE_URL = "https://sinewix.onrender.com";

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Sinewix] Fetching:", mediaType, tmdbId, season, episode);

  var sinewixType = mediaType === "movie" ? "movie" : "series";
  var catalogId = mediaType === "movie" ? "sinewix-movies" : "sinewix-series";

  // Önce TMDB'den başlık al
  var tmdbType = mediaType === "movie" ? "movie" : "tv";
  var tmdbUrl = "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "?language=tr-TR&api_key=4ef0d7355d9ffb5151e987764708ce96";

  return fetch(tmdbUrl)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var title = data.title || data.name || "";
      console.log("[Sinewix] Title:", title);
      if (!title) return [];
      return searchAndStream(title, catalogId, sinewixType, season, episode);
    })
    .catch(function(err) {
      console.error("[Sinewix] TMDB error:", err.message);
      return [];
    });
}

function searchAndStream(title, catalogId, sinewixType, season, episode) {
  var searchUrl = BASE_URL + "/catalog/" + sinewixType + "/" + catalogId + "/search=" + encodeURIComponent(title) + ".json";
  console.log("[Sinewix] Search URL:", searchUrl);

  return fetch(searchUrl, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data || !data.metas || data.metas.length === 0) {
        console.log("[Sinewix] No results for:", title);
        return [];
      }

      var sinewixId = data.metas[0].id;
      console.log("[Sinewix] Found ID:", sinewixId);
      return fetchStreams(sinewixId, sinewixType, season, episode);
    })
    .catch(function(err) {
      console.error("[Sinewix] Search error:", err.message);
      return [];
    });
}

function fetchStreams(sinewixId, sinewixType, season, episode) {
  var streamId;
  if (sinewixType === "movie") {
    streamId = sinewixId;
  } else {
    streamId = sinewixId + ":" + season + ":" + episode;
  }

  var streamUrl = BASE_URL + "/stream/" + sinewixType + "/" + streamId + ".json";
  console.log("[Sinewix] Stream URL:", streamUrl);

  return fetch(streamUrl, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
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
          title: s.title || "Sinewix",
          url: s.url,
          quality: s.quality || "HD",
          headers: {
            "Referer": BASE_URL,
            "User-Agent": "Mozilla/5.0"
          }
        };
      }).filter(function(s) { return s.url; });
    })
    .catch(function(err) {
      console.error("[Sinewix] Stream error:", err.message);
      return [];
    });
}
module.exports = { getStreams };
