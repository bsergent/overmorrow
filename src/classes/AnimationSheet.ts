import $ = require('jquery');
import * as moment from '../../node_modules/moment/moment';
import Color from '../primitives/Color';
import Rectangle from '../primitives/Rectangle';
import Renderer from '../Renderer';
import { Filter, FilterReplaceColor } from '../primitives/Filter';

export default class AnimationSheet {
  private _frames: Frame[] = [];
  private _width: number;
  private _height: number;
  private _imageUrl: string;
  private _currentFrameIndex: number;
  private _currentTag: FrameTag = null;
  private _initialTag: string = '';
  private _frameTags: Map<string, FrameTag> = new Map();
  private _lastAnimationTime: moment.Moment;
  private _durationMultiplier: number = 1;
  private _currentDirectionForward: boolean;
  private _filters: Filter[] = [];
  public paused: boolean = false;

  constructor(urlImage: string) {
    $.ajax({
      type: 'GET',
      url: urlImage.substring(0, urlImage.lastIndexOf('.')) + '.json',
      dataType: 'json',
      async: true,
      success: (data) => {
        for (let f of data.frames)
          this._frames.push({
            duration: f.duration,
            frame: new Rectangle(f.frame.x, f.frame.y, f.frame.w, f.frame.h),
            sourceSize: {
              w: f.sourceSize.w,
              h: f.sourceSize.h
            }
          });
        this._width = data.meta.size.w;
        this._height = data.meta.size.h;
        this._imageUrl = urlImage;
        for (let frameTag of data.meta.frameTags as FrameTag[])
          this._frameTags.set(frameTag.name, frameTag);
        if (this._initialTag === '') this.setFrameTag(data.meta.frameTags[0].name);
        else this.setFrameTag(this._initialTag);
      }
    });
  }

  public draw(ui: Renderer, rect: Rectangle): void {
    if (this._frames.length <= 0) return;

    // Advance frame
    if (!this.paused && this._lastAnimationTime.clone().add(this._frames[this._currentFrameIndex].duration * this._durationMultiplier, 'ms') < moment()) {
      // Increment the frame index
      if (this._currentDirectionForward) this._currentFrameIndex++;
      else this._currentFrameIndex--;

      // Figure out which direction to increment the frame and jump if needed
      if (this._currentFrameIndex >= this._currentTag.to)
        if (this._currentTag.direction === 'pingpong')
          this._currentDirectionForward = false;
        else
          this._currentFrameIndex = this._currentTag.from;
      else if (this._currentFrameIndex <= this._currentTag.from)
        if (this._currentTag.direction === 'pingpong')
          this._currentDirectionForward = true;
        else
          this._currentFrameIndex = this._currentTag.to;

      this._lastAnimationTime = moment();
    }

    // Draw
    let frame = this._frames[this._currentFrameIndex].frame;
    //ui.beginTemp(rect.width, rect.height);
    //ui.applyFilters(this._filters);
    //ui.drawSprite(new Rectangle(0, 0, rect.width, rect.height), frame, this._imageUrl);
    //ui.closeTemp(rect.x1, rect.y1);
    ui.drawSprite(rect, frame, this._imageUrl);//, 1, { deg: 90, x: 0.5, y: 0.5 });
  }

  public setFrameTag(name: string): AnimationSheet {
    //console.log('frameTag=' + name);
    if (this._frames.length <= 0 || (this._currentTag !== null && this._currentTag.name === name)) {
      this._initialTag = name;
      return this;
    }
    this._currentTag = this._frameTags.get(name);
    this._currentFrameIndex = this._currentTag.from;
    this._currentDirectionForward = this._currentTag.direction !== 'reverse';
    this._lastAnimationTime = moment();
    return this;
  }

  public set frameTag(value: string) {
    this.setFrameTag(value);
  }

  public get progress(): number {
    // TODO Support other animation directions
    return (this._currentFrameIndex - this._currentTag.from) / (this._currentTag.to - this._currentTag.from);
  }

  public set progress(value: number) {
    // TODO Support other animation directions
    this._currentFrameIndex = Math.round(value * (this._currentTag.to - this._currentTag.from) + this._currentTag.from);
  }

  public setDurationMultipler(multiplier: number): AnimationSheet {
    this._durationMultiplier = multiplier;
    return this;
  }

  public replaceColor(original: Color, replacement: Color): AnimationSheet {
    for (let filter of this._filters) { // Set replacement to null to remove
      if (filter !instanceof FilterReplaceColor) continue;
      if ((filter as FilterReplaceColor).originalColor === original) {
        (filter as FilterReplaceColor).replacementColor = replacement;
        return;
      }
    }
    this._filters.push(new FilterReplaceColor(original, replacement));
    return this;
  }
}

interface Frame {
  duration: number,
  frame: Rectangle,
  sourceSize: {
    w: number,
    h: number
  }
}

interface FrameTag {
  name: string,
  from: number,
  to: number,
  direction: 'forward'|'reverse'|'pingpong'
}