declare var requirejs;
var DEBUG = false;
requirejs.config({
  baseUrl: 'js',
  paths: {
      'jquery': '../node_modules/jquery/dist/jquery'
  }
});
requirejs(['Demo'],
function  ( Demo ) {
});