const consoleApp = require('@fidojs/fidojs-kennel-console');
const { GlitchPlease } = require('glitch-please');
const path = require('path');
const fs = require('fs');

module.exports = function(appRoot) {
  const please = new GlitchPlease({
    appRoot: appRoot, 
    distPath (appRoot, appPackageJSON) {
      if (appPackageJSON['bit-docs'].hasOwnProperty('dest')) {
        return path.join(appRoot, appPackageJSON['bit-docs']['dest']);
      } else {
        return path.join(appRoot, 'doc');
      }
    },
    distRoute (appPackageJSON) {
        return '/';
    }
  });

  //  cmd: path.join(__dirname, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  please.appWatchRun(function(appPackageJSON) {
    return [appPackageJSON['bit-docs']['glob']['pattern']];
  }, {
    cmd: 'npm',
    args: ['run', 'generate']
  });

  please.server.use('/console-app', consoleApp);

  return please;
}
