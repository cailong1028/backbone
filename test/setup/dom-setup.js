define([
    'jquery'
], function($){
    $('body').append(
    '<div id="qunit"></div>' +
    '<div id="qunit-fixture">' +
        '<div id="testElement"><h1>Test</h1></div>' +
    '</div>'
    );
});