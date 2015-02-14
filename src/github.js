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
    cb();
  });
}

var github_events = {
  CommitCommentEvent: function (event, user, repo, payload) {
    return { subtitle: user+' commented on a commit in '+repo,
             body: payload.comment.body };
  },
  CreateEvent: function (event, user, repo, payload) {
    return user+' created '+(payload.ref?'a '+payload.ref_type+' in ':'')+repo;
  },
  DeleteEvent: function (event, user, repo, payload) {
    return user+' deleted a '+payload.ref_type+' in '+repo;
  },
  ForkEvent: function (event, user, repo) {
    return user+' forked '+repo;
  },
  GollumEvent: function (event, user, repo) {
    return user+' updated the wiki in '+repo;
  },
  IssueCommentEvent: function (event, user, repo, payload) {
    return { subtitle: user+' commented on an issue in '+repo,
             body: payload.comment.body };
  },
  IssuesEvent: function (event, user, repo, payload) {
    return { subtitle: user+' '+payload.action+' an issue in '+repo,
             body: payload.issue.title };
  },
  MemberEvent: function (event, user, repo) {
    return user+' added a collaborator to '+repo;
  },
  PageBuildEvent: function (event, user, repo) {
    return null;
  },
  PublicEvent: function (event, user, repo) {
    return user+' made '+repo+' open source';
  },
  PullRequestEvent: function (event, user, repo, payload) {
    return { subtitle: user+' '+payload.action+' a pull request on '+repo,
             body: payload.pull_request.title };
  },
  PullRequestReviewCommentEvent: function (event, user, repo, payload) {
    return { subtitle: user+' commented on a pull request on '+repo,
             body: payload.comment.body };
  },
  PushEvent: function (event, user, repo, payload) {
    var commits = payload.commits.map(function(c){return '- '+c.message;}).join('\n');
    return { subtitle: user+' pushed to '+repo,
             body: commits };
  },
  ReleaseEvent: function (event, user, repo) {
    return user+' released a new version of '+repo;
  },
  WatchEvent: function (event, user, repo) {
    return user+' starred '+repo;
  }
};

module.exports = function (user, cb) {
  github_req(user, function (data) {
    var feed = [];
    data = data.slice(0, 10);
    data.forEach(function (item) {
      var out =  { event: item.type, repo: item.repo.name };
      var user = item.actor.login;
      var repo = item.repo.name;

      if (github_events[item.type]) {
        var event = github_events[item.type](item, user, repo, item.payload);
        out.subtitle = event.subtitle || event;
        out.body = event.body || '';
      } else {
        out.subtitle = item.type;
      }

      feed.push(out);
    });
    cb(feed);
  });
};
