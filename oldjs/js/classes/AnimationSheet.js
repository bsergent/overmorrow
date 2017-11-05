define(['moment'],
function(moment ) {
  /* Private */
  
  /* Public */
  return function AnimationSheet(image, json) {
    var json;
    var image;

    // Load json
    $.ajax({
      type: 'GET',
      url: json,
      dataType: 'json',
      success: function(data) {
        json = data;
        console.log(json);
      },
      async: false
    });

    // Parse json
    this.frames = json.frames;
    this.width = json.meta.size.w;
    this.height = json.meta.size.h;
    this.image = new Image();
    this.image.src = image;
    this.animation = {};

    for (var i = 0; i < json.meta.frameTags.length; i++) {
      var tag = json.meta.frameTags[i];
      this.animation[tag.name] = {
        from: tag.from,
        to: tag.to,
        direction: tag.direction
      };
      if (i == 0) this.defaultAnimation = tag.name;
    }

    this.draw = function(ctx, x, y, width, height) {
      if (!this.lastAnimationTime) {
        this.currentAnimation = this.defaultAnimation;
        this.frame = this.animation[this.currentAnimation].from;
        this.lastAnimationTime = moment();
      }
      if (this.lastAnimationTime.clone().add(this.frames[this.frame].duration, 'ms') < moment()) {
        // Advance frame
        this.frame++;
        if (this.frame > this.animation[this.currentAnimation].to)
          this.frame = this.animation[this.currentAnimation].from;
        this.lastAnimationTime = moment();
      }

      // Draw
      var frame = this.getCurrentFrame();
      ctx.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, x, y, width, height);

      if (this.tint) {
        var imageData = ctx.getImageData(0,0,this.width,this.height);
        var pixelChannels = imageData.data;
        for (var i = 0; i < pixelChannels.length; i+=4) {
          if (pixelChannels[i] == pixelChannels[i+1]
                && pixelChannels[i+1] == pixelChannels[i+2]) {
            // Recolor white pixels to the color specified
            pixelChannels[i  ] = Math.min(Math.floor(pixelChannels[i  ] * this.tint.r), 255);
            pixelChannels[i+1] = Math.min(Math.floor(pixelChannels[i+1] * this.tint.g), 255);
            pixelChannels[i+2] = Math.min(Math.floor(pixelChannels[i+2] * this.tint.b), 255);
          }
        }
        ctx.putImageData(imageData,0,0);
      }
    };
    this.getCurrentFrame = function () {
      return {
        x: this.frames[this.frame].frame.x,
        y: this.frames[this.frame].frame.y,
        w: this.frames[this.frame].frame.w,
        h: this.frames[this.frame].frame.h
      }
    };
    this.setAnimation = function(frameTag) {
      console.log('Set animation to ' + frameTag);
      this.currentAnimation = frameTag;
      this.frame = this.animation[this.currentAnimation].from;
      this.lastAnimationTime = moment();
    };
    this.getAnimation = function() {
      return this.currentAnimation;
    };
     // Note that this will colorize the entire canvas until fixed
    this.colorize = function(r,g,b) { // Only works with grayscale images
      this.tint = {
        r: r / 255,
        g: g / 255,
        b: b / 255
      };
    };
  };
});