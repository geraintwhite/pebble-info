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
    func: function () { github_feed(); }
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
  card.on('click', 'select', function (e) {
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

menu.on('select', function (e) {
  console.log(e.itemIndex);
  selected_item = menu_items[e.itemIndex];
  selected_item.func();
});

menu.show();


function github_feed () {
  loading_card.show(selected_item.title);

  github(selected_item.subtitle, function (feed) {
    console.log(feed);
    
    var feed_list = new UI.Menu({ title: 'Github Feed' });
    var items = [];
    feed.forEach(function (feed_item) {
      items.push({ title: feed_item.type, subtitle: feed_item.str });
    });
    feed_list.items(0, items);
    feed_list.show();

    loading_card.hide();
  });
}

function sysinfo (url) {
  loading_card.show(selected_item.title);

  ajax({
    url: url,
    type: 'json'
  }, function (data) {
    console.log(data);
    data_card.show(selected_item.title, selected_item.subtitle, data.content);
    loading_card.hide();

  }, function (err) {
    console.log(err);
    data_card.show(selected_item.title, 'Failed to fetch data');
    loading_card.hide();
  });
}

function ghl (url) {
  loading_card.show(selected_item.title);
  
  ajax({
    url: url,
    type: 'json'
  }, function (data) {
    console.log(data);
    
    var body = 'Committer: ' + data.last_payload.head_commit.author.name +
        '\nCommit: ' + data.last_payload.head_commit.message +
        '\nRepository: ' + data.last_payload.repository.full_name;

    data_card.show(selected_item.title, selected_item.subtitle, body);
    loading_card.hide();

  }, function (err) {
    console.log(err);
    data_card.show(selected_item.title, 'Failed to fetch data');
    loading_card.hide();
  });
}
