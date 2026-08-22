@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@echo off
title %0

if "%HOME%" == "" (set "HOME=%USERPROFILE%")

setlocal enabledelayedexpansion

set ERROR_CODE=0

if not "%JAVA_HOME%" == "" goto OkJHome

if exist "C:\Program Files\Java\jdk-21.0.11" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.11"
    goto OkJHome
)

if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
    goto OkJHome
)
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJHome
if exist "%JAVA_HOME%\bin\java.exe" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:init

set MAVEN_PROJECTBASEDIR=%CD%
set WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if exist "%WRAPPER_JAR%" (
    goto run
) else (
    echo Downloading maven-wrapper.jar...
    if not exist "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper" mkdir "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper"
    
    @REM Find wrapperUrl in properties file
    for /F "usebackq tokens=1,2 delims==" %%A in ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") do (
        if "%%A"=="wrapperUrl" (
            set DOWNLOAD_URL=%%B
        )
    )
    
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('!DOWNLOAD_URL!', '%WRAPPER_JAR%')"
    if %ERRORLEVEL% neq 0 (
        echo Error: Could not download maven-wrapper.jar.
        goto error
    )
    goto run
)

:run
set CLASSPATH=%WRAPPER_JAR%
"%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% -classpath "%CLASSPATH%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
endlocal & set ERROR_CODE=%ERROR_CODE%
cmd /c exit /b %ERROR_CODE%
