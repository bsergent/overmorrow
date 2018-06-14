declare var requirejs;
var DEBUG = false;
var UNITTEST = false;
requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery': '../node_modules/jquery/dist/jquery'
  }
});
if (UNITTEST) {
  requirejs(['UnitTesting'],
  function  ( UnitTesting ) {
  });
} else {
  requirejs(['demo/Demo'],
  function  ( Demo ) {
  });
}