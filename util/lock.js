const { EventEmitter } = require('events');

let numberAquiring = 0

const lock = () => {
  let locked = {};
  const ee = new EventEmitter();
  ee.setMaxListeners(0);

  return {
    acquire: key =>
      new Promise(resolve => {
        if (!locked[key]) {
          locked[key] = true;
          return resolve();
        }
        // console.log('number waiting:', ++numberAquiring, new Error().stack)
        const tryAcquire = value => {
          if (!locked[key]) {
            locked[key] = true;
            ee.removeListener(key, tryAcquire);
            return resolve(value);
          }
        };
        
        ee.on(key, tryAcquire);
      }),

    // If we pass a value, on release this value
    // will be propagated to all the code that's waiting for
    // the lock to release
    release: (key, value) => {
      Reflect.deleteProperty(locked, key);
      setImmediate(() => ee.emit(key, value));
    },
  };
};

module.exports = lock