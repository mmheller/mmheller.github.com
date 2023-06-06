rem -----------------------------------------------
rem -   Windows script to configure environment for Node.js
rem -
rem -  The script sets an environment variable pointing to the installation directory
rem -  for a specified version of Node.js (https://nodejs.org/en/). The installation
rem -  path is then added to the system path and a new command window is launched.
rem -
rem - Node.js information on supported environment variables:
rem -   node --help
rem -   https://nodejs.org/docs/latest-v12.x/api/cli.html#cli_environment_variables
rem -
rem -
rem - See also:
rem -   [Node.js Home](https://nodejs.org/en/)
rem -   [ADIwg GitHub] (https://github.com/adiwg)
rem -----------------------------------------------

set home=C:\MattsExtras

rem -
rem - Define local Node.js version and installation path
rem -

rem set NJS_INST=%HOME%\bin\node-v10.13.0-win-x64
rem set NJS_INST=%HOME%\bin\node-v12.22.12-win-x64
rem set NJS_INST=%HOME%\bin\node-v14.21.2-win-x64
rem set NJS_INST=%HOME%\bin\node-v16.19.0-win-x64
set NJS_INST=%HOME%\node-v18.16.0-win-x64


rem set GIT_PATH=%HOME%\bin\Git\mingw64\bin
set GIT_PATH=C:\Users\mheller\AppData\Local\GitHubDesktop\app-3.1.5\resources\app\git\mingw64\bin

set PATH=%NJS_INST%;%GIT_PATH%;%path%

start "NODE %NJS_INST:~-16% - Console - %~dp0%" color 0e
