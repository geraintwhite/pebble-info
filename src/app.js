var UI = require('ui'),
    ajax = require('ajax'),
    github = require('./github');


var menu = new UI.Menu({
  sections: [{
    items: [
      { title: 'Pi System Info' },
      { title: 'GitHub Feed' }
    ]
  }, {
    title: 'GitHub Listener',
    items: [
      { title: 'VPS' },
      { title: 'Raspberry Pi' }
    ]
  }]
});

var card = new UI.Card({
  title: 'System Info',
  subtitle: 'Fetching...',
  scrollable: true
});

menu.on('select', function (e) {
  console.log(e.itemIndex);
  console.log(e.sectionIndex);

  switch (e.sectionIndex) {
    case 0:
      switch (e.itemIndex) {
        case 0:
          // Pi System Info
          break;
        case 1:
          github_feed();
          break;
      }
      break;
    case 1:
      break;
  }
});

menu.show();


function github_feed () {
  card.show();
  card.title('Github Feed');

  var user = 'grit96';
  github(user, function (feed) {
    console.log(feed);
    card.subtitle();
    card.body(feed.join('\n\n'));
  });
}


// card.on('click', 'select', function (e) {
//   console.log('show menu');
//   menu.show();
// });

// function update_sysinfo () {
//   ajax({
//     url: 'http://node.dvbris.com/sysinfo?pebble',
//     type: 'json'
//   }, function (data) {
//     console.log(data);
//     card.subtitle('Raspberry Pi');
//     card.body(data.content);
//   }, function (err) {
//     console.log(err);
//     card.subtitle('Failed to fetch data');
//   });
// }

// update_sysinfo();
