var Vue = require('vue');

var app = new Vue({
  el: "#app",
  components: {
    calendar: require("./calendar.vue")
  }
});