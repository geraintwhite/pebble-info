var ajax = require('ajax');

function github_req(user, cb) {
  ajax({
    url: 'https://api.github.com/users/' + user + '/events',
    type: 'json'
  }, function (data) {
    console.log(data);
    cb(data);
  }, function (err) {
    console.log(err);
  });
}

module.exports = function (user, cb) {
  github_req(user, function (data) {
    var feed = [];
    data = data.slice(0, 10);
    data.forEach(function (item) {
      feed.push({ event: item.type, repo: item.repo.name });
    });
    cb(feed);
  });
};
