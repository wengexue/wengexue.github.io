// 
// Game utilities
//

var objTimer =
{
  time: 0,
  interval: undefined,

  start: function()
  {
    var self = this;
	  this.interval = setInterval(function(){self.tick();}, 1000);
  },
  tick: function()
  {
    this.time--;
  },
  stop: function()
  {
    clearInterval(this.interval);
  },
  reset: function()
  {
    this.time = 0;
  }
};