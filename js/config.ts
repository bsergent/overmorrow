declare var requirejs;
var DEBUG = false;
requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js',
  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
      //jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
      'jquery': '../node_modules/jquery/dist/jquery',
      'moment': '//momentjs.com/downloads/moment'
  },
  // Wait up to this amount; needed bc loading from URLs
  waitSeconds : 15,
  // Configurations
  config: {
    moment: {
      noGlobal: true
    }
  }
});
requirejs(['Demo'],
function  ( Demo ) {
});