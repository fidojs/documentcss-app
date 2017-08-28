const consoleApp = require('@fidojs/fidojs-kennel-console');
const { GlitchPlease } = require('glitch-please');
const path = require('path');
const fs = require('fs');

module.exports = function(appRoot, getDistPath, buildCommand) {
  const please = new GlitchPlease({
    appRoot: appRoot, 
    distPath (appRoot, appPackageJSON) {
      return getDistPath(appRoot, appPackageJSON);
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
    args: ['run', buildCommand]
  });

  please.server.use('/console-app', consoleApp);

  return please;
}
