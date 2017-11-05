define([''],
function() {
  return function UIPanel(title, x, y, width, height, skin) {
    // Functionality Description
    // - Draggable
    // - Closeable
    // - Recursive to an extent
    // - Elements use relative coordinates
    skin.borderPatch = {
      img: new Image(),
      url: skin.borderPatch,
      patchWidth: 0
    }
    skin.borderPatch.img.src = skin.borderPatch.url;
    skin.borderPatch.img.onload = function () {
      skin.borderPatch.patchWidth = skin.borderPatch.img.width / 3;
      skin.borderPatch.patchWidthScaled = skin.borderPatch.patchWidth * skin.scale;
    };

    /* Private Properties */
    var elements = [];

    /* Public Properties */
    this.title = title;

    /* Construction Methods */
    // Label
    this.addLabel = function (x, y, text, fontSize, color, centered) {

    };
    // String with text wrap
    this.addText = function () {

    };
    // Image
    this.addImage = function () {

    };
    // Editable text box
    this.addTextBox = function () {

    };
    // Clickable button
    this.addButton = function () {

    };
    // Custom elements
    this.addElement = function () {

    };
    // Inception
    this.addPanel = function () {

    };

    /* Public Methods */
    this.draw = function (ui) {
      // Fade world
      ui.drawRect(0, 0, ui.getWidth(), ui.getHeight(), 'rgba(0,0,0,0.3)');

      // Background
      ui.drawRect(x + skin.borderPatch.patchWidthScaled, y + skin.borderPatch.patchWidthScaled, width - 2*skin.borderPatch.patchWidthScaled, height - 2*skin.borderPatch.patchWidthScaled, skin.backgroundColor);

      // Border
      /* 0 1 2 (Render order)
         3 - 4
         5 6 7 */
      // Top
      ui.drawSprite(
        x,
        y,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        0,
        0,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      ui.drawSprite(
        x + skin.borderPatch.patchWidthScaled,
        y,
        width - 2*skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidth,
        0,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      ui.drawSprite(
        x + width - skin.borderPatch.patchWidthScaled,
        y,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        2*skin.borderPatch.patchWidth,
        0,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      // Middle
      ui.drawSprite(
        x,
        y + skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        height - 2*skin.borderPatch.patchWidthScaled,
        0,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      ui.drawSprite(
        x + width - skin.borderPatch.patchWidthScaled,
        y + skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        height - 2*skin.borderPatch.patchWidthScaled,
        2*skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      // Bottom
      ui.drawSprite(
        x,
        y + height - skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        0,
        2*skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      ui.drawSprite(
        x + skin.borderPatch.patchWidthScaled,
        y + height - skin.borderPatch.patchWidthScaled,
        width - 2*skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidth,
        2*skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      ui.drawSprite(
        x + width - skin.borderPatch.patchWidthScaled,
        y + height - skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        skin.borderPatch.patchWidthScaled,
        2*skin.borderPatch.patchWidth,
        2*skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.patchWidth,
        skin.borderPatch.url
      );
      
      // Title
      if (title) {
        ui.drawSprite(
          x,
          y + skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidthScaled,
          0,
          0,
          skin.borderPatch.patchWidth,
          skin.borderPatch.patchWidth,
          skin.borderPatch.url
        );
        ui.drawSprite(
          x + skin.borderPatch.patchWidthScaled,
          y + skin.borderPatch.patchWidthScaled,
          width - 2*skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidth,
          0,
          skin.borderPatch.patchWidth,
          skin.borderPatch.patchWidth,
          skin.borderPatch.url
        );
        ui.drawSprite(
          x + width - skin.borderPatch.patchWidthScaled,
          y + skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidthScaled,
          skin.borderPatch.patchWidthScaled,
          2*skin.borderPatch.patchWidth,
          0,
          skin.borderPatch.patchWidth,
          skin.borderPatch.patchWidth,
          skin.borderPatch.url
        );
        ui.drawText(x + skin.borderPatch.patchWidthScaled*0.4, y + skin.borderPatch.patchWidthScaled*0.9, title, 24, skin.fontColor, false, 'ReviseLib');
      }
    };
    this.interact = function (event) {
      
    };
  };
});