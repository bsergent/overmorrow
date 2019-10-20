import Color from "./Color";

export class Filter {
  constructor() {
  }
  public apply(pixel: Color): Color {
    return pixel;
  }
}

export class FilterReplaceColor extends Filter {
  public originalColor: Color;
  public replacementColor: Color;
  constructor(original: Color, replacement: Color) {
    super();
    this.originalColor = original;
    this.replacementColor = replacement;
  }
  public apply(pixel: Color): Color {
    return pixel.equals(this.originalColor) ? this.replacementColor : pixel;
  }
}