declare var requirejs;
var DEBUG = false;
var UNITTEST = false;
var version = '';

// Load version information for Overmorrow package
let verreq = new XMLHttpRequest(); // a new request
verreq.open('GET', '../package.json', false);
verreq.send(null);
version = JSON.parse(verreq.responseText).version;
document.getElementById('version').textContent = version;

// Configure RequireJS
requirejs.config({
  baseUrl: '../',
  paths: {
    'jquery': 'node_modules/jquery/dist/jquery'
  }
});

// Load package
if (UNITTEST) {
  requirejs(['UnitTesting'],
  function  ( UnitTesting ) {
  });
} else {
  let whichdemo = 'Overworld';
  if (window.location.href.indexOf('?'))
    whichdemo = window.location.href.substr(window.location.href.indexOf('?') + '?'.length);
  document.getElementById('demo').textContent = whichdemo;
  requirejs([`demo/dist/Demo${whichdemo}`],
  function  ( Demo ) {
  });
}