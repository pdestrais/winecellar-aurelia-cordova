Requirements
==========

- cordova
- webpack
- webpack-dev-server


Setup
=====

- Install node dependencies: ``npm install``

 > For a clean installation, it's better to first delete the node_modules directory before executing this command.

Run in browser
==============

- Launch ``npm run dev`` to launch the webpack debug server (with live reload).


Build for android
=================

- Add platform: ``cordova platform add browser``
- Add platform: ``cordova platform add android``
- Run on browser (with cordova for debug): ``cordova run browser``
- Build for phone: ``cordova build android`` or ``npm run build-android``

Run in emulator
===============
- run in android emulator ``cordova run android --emulator``

 > **Note :** You can create the emulator with the following command ``emulator -avd nexus6`` (name cvd created beforehand)
