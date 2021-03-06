var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var theRottenAPI = function() {
  exports = module.exports = {};
  var httpGet = function(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, false);
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
  };

  var urls = [], err = new Error('Account Inactive');
  var foundError = function (res) {
    if (res.error === 'Account Inactive') {
      return true;
    }
    return false;
  };

  exports.apiKey = function (key) {
    this.apikey = key;

    urls = ['http://api.rottentomatoes.com/api/public/v1.0/movies.json?' + 'apikey=' + this.apikey,
            'http://api.rottentomatoes.com/api/public/v1.0/movies/',
            'http://api.rottentomatoes.com/api/public/v1.0/lists',
            'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/'];
  };

  exports.search = function (options, cb) {
    var q = options.query || options || null;
    var page = options.page || null;
    var pageLimit = options.pageLimit || null;

    if ((q === null) || (typeof q !== 'string')) {
      throw new Error('invalid type error');
    }

    if (page === null) { page = ''; } else { page = '&page=' + page.toString(); }
    if (pageLimit === null) { pageLimit = ''; } else { pageLimit = '&pageLimit=' + pageLimit.toString(); }

    var url = urls[0] + '&q=' + q + pageLimit + page;
    var res = httpGet(url);

    if (foundError(res)) { cb(err); return; }
    cb(null, res.movies);
  };

  exports.info = function (options, cb) {
    var id = options.id || options || null;
    var limitTo = options.limitTo || null;

    if ((id === null) || (typeof id !== 'number')) {
      throw new Error('movie id required');
    }

    var url = urls[1] + id + '.json?' + 'apikey=' + this.apikey;
    var res = httpGet(url);

    if (foundError(res)) { cb(err); return; }

    if (limitTo !== null) {
      if (limitTo === 'cast') {
        var cast = httpGet(res.links.cast + '?apikey=' + this.apikey);
        cb(null, cast);

      } else if (limitTo === 'reviews') {
        var reviews = httpGet(res.links.reviews + '?apikey=' + this.apikey);
        cb(null, reviews);

      } else {
        cb(new Error('invalid option'));
      }
    } else {
      cb(null, res);
    }
  };

  exports.lists = function (directory, cb) {
    var dir = directory;
    var url;

    if (typeof dir !== 'string') {
      throw new Error('invalid type error');
    }

    if (dir === '') {
      url = urls[2] + '.json?apikey=' + this.apikey;
    } else {
      url = urls[2]  + '/' + dir + '.json?apikey=' + this.apikey;
    }

    var res = httpGet(url);

    if (foundError(res)) { cb(err); return; }
    cb(null, res);
  };

  exports.movies = function (options, cb) {
    var list = options.list || options || null;
    var limit = options.limit || null;
    var page = options.page || null;
    var country = options.country || null;

    if ((list === null) || (typeof list !== 'string')) {
      throw new Error('list required');
    }

    if (limit === null) { limit = ''; } else { limit = '&limit=' + limit.toString(); }
    if (country === null) { country = ''; } else { country = '&country=' + country; }
    if (page === null) { page = ''; } else { page = '&page=' + page; }

    url = urls[3] + list + '.json?apikey=' + this.apikey + limit + page + country;
    var res = httpGet(url);

    if (foundError(res)) { cb(err); return; }
    cb(null, res.movies);
  };

  return exports;
}();

