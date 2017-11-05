requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js',
  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
      jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
      moment: '//momentjs.com/downloads/moment',
      bootstrap: '../../../bootstrap/dist/js/bootstrap.min'
  },
  // Wait up to this amount; needed bc loading from URLs
  waitSeconds : 15,
  // Makes the following requireJS compatible by putting it in a wrapper
  shim: {
    bootstrap: {
      deps: ['jquery'],
      exports: 'bootstrap'
    }
  },
  // Configurations
  config: {
    moment: {
      noGlobal: true
    }
  }
});