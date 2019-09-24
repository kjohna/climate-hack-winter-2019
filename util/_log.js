const Red = "\u001b[31m"
const Reset = "\u001b[0m"


_log = (function (undefined) {
  var Log = Error; // does this do anything?  proper inheritance...?
  Log.prototype.write = function (args) {
    /// <summary>
    /// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
    /// </summary>
    /// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
    /// <remarks>Includes line numbers by calling Error object -- see
    /// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
    /// * https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
    /// * https://stackoverflow.com/a/3806596/1037948
    /// </remarks>

    // via @fredrik SO trace suggestion; wrapping in special construct so it stands out

    // var suffix ='_log crap';
    try {
      suffix = {
        "@": (this.lineNumber
          ? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
          : extractLineNumberFromStack(this.stack)
        )
      };
      // console.log('_logno error suffix', suffix)
    }
    catch (err) {
      console.log('_log error', err)
      suffix = err
    }

    args = args.concat([suffix]);
    // via @paulirish console wrapper
    if (console && console.log) {
      if (console.log.apply) { console.log.apply(console, args); } else { console.log(args); } // nicer display in some browsers
    }
  };
  var extractLineNumberFromStack = function (stack) {
    /// <summary>
    /// Get the line/filename detail from a Webkit stack trace.  See https://stackoverflow.com/a/3806596/1037948
    /// </summary>
    /// <param name="stack" type="String">the stack string</param>

    stack = (new Error).stack
    //      console.log('using extractLineNumberFromStack', stack)

    if (!stack) return '?'; // fix undefined issue reported by @sigod

    // correct line number according to how Log().write implemented
    var line = stack.split('\n')[4];
    // fix for various display text
    line = (line.indexOf(' (') >= 0
      ? line.split(' (')[1].substring(0, line.length - 1)
      : line.split('at ')[1]
    );
    return line;
  };

  return function (params) {
    /// <summary>
    /// Paulirish-like console.log wrapper
    /// </summary>
    /// <param name="params" type="[...]">list your logging parameters</param>

    // only if explicitly true somewhere
    if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE) return;

    // call handler extension which provides stack trace
    Log().write(Array.prototype.slice.call(arguments, 0)); // turn into proper array
  };//--  fn  returned

})();//--- _log

// // no debug mode
// console.log(typeof _log)
// _log('this should not appear');

// // turn it on
// DEBUGMODE = true;

// _log('you should', 'see this', { a: 1, b: 2, c: 3 });
// console.log('--- regular log ---');
// _log('you should', 'also see this', { a: 4, b: 8, c: 16 });

// // turn it off
// DEBUGMODE = false;

// _log('disabled, should not appear');
// console.log('--- regular log2 ---');



module.exports = _log