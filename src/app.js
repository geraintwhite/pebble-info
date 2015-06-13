var UI = require('ui'),
    ajax = require('ajax'),
    github = require('./github');


var selected_item;
var menu_items = [{
    title: 'System Info',
    subtitle: 'Raspberry Pi',
    func: function () { sysinfo('http://node.dvbris.com/sysinfo?pebble'); }
  }, {
    title: 'GitHub Feed',
    subtitle: 'grit96',
    func: function () { github_feed('grit96'); }
  }, {
    title: 'Github Listener',
    subtitle: 'VPS',
    func: function () { ghl('http://git.geraintwhite.co.uk/?refresh'); }
  }, {
    title: 'Github Listener',
    subtitle: 'Raspberry Pi',
    func: function () { ghl('http://git.dvbris.com/?refresh'); }
}];

var menu = new UI.Menu();
menu.items(0, menu_items);


var screen = (function () {
  var screen = {};

  var loading_card = (function () {
    var card = new UI.Card({ subtitle: 'Fetching...' });
    return {
      show: function (title) {
        card.title(title);
        card.show();
      }, hide: function () { card.hide(); }
    };
  })();

  var data_card = (function () {
    var card = new UI.Card({ scrollable: true });
    card.on('click', 'select', function () {
      selected_item.func();
    });
    return {
      show: function (title, subtitle, body) {
        card.title(title);
        card.subtitle(subtitle);
        card.body(body || '');
        card.show();
      }, hide: function () { card.hide(); }
    };
  })();
  
  screen.load = function () { loading_card.show(selected_item.title); };
  screen.hide = function () { loading_card.hide(); };
  screen.data = function (data) {
    data_card.show(selected_item.title, selected_item.subtitle, data);
    loading_card.hide();
  };
  screen.err = function () {
    data_card.show(selected_item.title, 'Failed to fetch data');
    loading_card.hide();
  };

  return screen;

})();

menu.on('select', function (e) {
  console.log(e.itemIndex);
  selected_item = menu_items[e.itemIndex];
  selected_item.func();
});

menu.show();


function github_feed (username) {
  screen.load();

  github(username, function (feed) {
    console.log(feed);
    if (!feed) return screen.err();
    
    var feed_list = new UI.Menu({ title: 'Github Feed' });
    var items = [];
    feed.forEach(function (feed_item) {
      var card = new UI.Card({ scrollable: true })
                     .subtitle(feed_item.subtitle)
                     .body('\n'+feed_item.body);

      items.push({ title: feed_item.event, subtitle: feed_item.repo, card: card });
    });
    feed_list.items(0, items);
    feed_list.on('select', function (e) {
      console.log(e.itemIndex);
      items[e.itemIndex].card.show();
    });
    feed_list.show();

    screen.hide();
  });
}

function sysinfo (url) {
  screen.load();

  ajax({
    url: url,
    type: 'json'
  }, function (data) {
    console.log(data);
    if (!data) return screen.err();
    screen.data(data.content);

  }, function (err) {
    console.log(err);
    screen.err();
  });
}

function ghl (url) {
  screen.load();
  
  ajax({
    url: url,
    type: 'json'
  }, function (data) {
    console.log(data);
    if (!Object.keys(data.last_payload).length) return screen.err();

    var body = 'Committer: ' + data.last_payload.head_commit.author.name +
        '\nCommit: ' + data.last_payload.head_commit.message +
        '\nRepository: ' + data.last_payload.repository.full_name;

    screen.data(body);

  }, function (err) {
    console.log(err);
    screen.err();
  });
}
