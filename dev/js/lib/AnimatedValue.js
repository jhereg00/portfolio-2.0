/**
 *  AnimatedValue class
 *  sets value based on keyframes and position in animation
 *
 *  `frame` property can be any arbitrary measurement. For example, maybe 0 - 1 for percentage based animation,
 *  or 0 - 10 for seconds based. Just use the same means of measurement when calling .get() and you'll get a
 *  useful value.
 *
 *  @param Array of keyframes (see below)
 *    @param {number} frame
 *    @param {number} value
 *    @param {function, optional} ease - function to be passed (start value, change, percentage of change)
 *  @param {boolean, optional} noStartBound - pass true to math the animation if the frame value is less than the first keyframe's
 *  @param {boolean, optional} noEndBound - pass true to continue the animation past the final keyframe using the last easing
 *
 *  @method get(frame) - gets value at the specified "frame"
 *
 *  code:
 *    var av = new AnimatedValue([
 *      {
 *        frame: 0,
 *        value: 0,
 *        ease: eases.easeIn
 *      },
 *      {
 *        frame: 100,
 *        value: 1
 *      }
 *    ]);
 *    av.get(80); // ~0.64
 */

/**
 *  Sample Keyframe array
[
  {
    frame: 0,
    value: 0,
    ease: eases.easeIn
  },
  {
    frame: 100,
    value: 1
  }
]
 */

var AnimatedValue = function (keyframes, noStartBound, noEndBound) {
  if (keyframes.length < 2)
    throw "AnimatedValue passed insufficient keyframes. Must have at least 2";

  this.keyframes = keyframes;
  this.length = this.keyframes[this.keyframes.length - 1].frame;
  this.startBound = !noStartBound;
  this.endBound = !noEndBound;
}
AnimatedValue.prototype = {
  get: function (frame) {
    // before or after
    if (this.startBound && this.keyframes[0].frame >= frame)
      return this.keyframes[0].value;
    else if (this.endBound && this.keyframes[this.keyframes.length - 1].frame <= frame)
      return this.keyframes[this.keyframes.length - 1].value;

    // nope, do the maths
    var keyframe = 1;
    for (; keyframe < this.keyframes.length - 1 && frame > this.keyframes[keyframe].frame; keyframe++);
    if (this.keyframes[keyframe - 1].ease) {
      return this.keyframes[keyframe - 1].ease(
        this.keyframes[keyframe - 1].value,
        this.keyframes[keyframe].value - this.keyframes[keyframe - 1].value,
        (frame - this.keyframes[keyframe - 1].frame) / (this.keyframes[keyframe].frame - this.keyframes[keyframe - 1].frame)
      );
    }
    else {
      return (this.keyframes[keyframe - 1].value + (this.keyframes[keyframe].value - this.keyframes[keyframe - 1].value) * (frame - this.keyframes[keyframe - 1].frame) / (this.keyframes[keyframe].frame - this.keyframes[keyframe - 1].frame));
    }
  }
}

module.exports = AnimatedValue;
