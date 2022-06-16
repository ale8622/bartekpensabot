# get microsoft image with dotnet sdk 3.1
FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine AS build

# jre requires man folder to exist on the server
RUN mkdir -p /usr/share/man/man1
# install libs for update-nuget-sources script
RUN apk update
RUN apk --no-cache add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN apk add jq 
RUN apk add openjdk11-jre

RUN dotnet tool install --global dotnet-reportgenerator-globaltool --version 4.4
RUN dotnet tool install --global dotnet-sonarscanner

# copy nuget config files and update nuget sources
ARG nugetCredentials=


RUN echo $nugetCredentials | \
  jq -r '.endpointCredentials[] | [.endpoint, .password] | @tsv' | \
  (while read ep pwd; \
    do \
      dotnet nuget update source "$ep" --username "ArtifactsDocker" --password="$pwd" --store-password-in-clear-text --valid-authentication-types "basic"; \
    done)



# copy source project files
WORKDIR /app

## copy sln
COPY *.sln .




# nuget restore
RUN dotnet restore --runtime alpine-x64

# copy everything else (excluding content specified in .dockerignore)
COPY . .

# read configuration and store into env variables
ARG buildConfiguration=Release
ENV BUILD_CONFIGURATION=${buildConfiguration}
ARG version=0.0.0

#start sonarqube
ARG buildSourceBranchName
ARG sonarProjectName
ARG sonarToken
ARG sonarUrl
ARG pullRequestId 
ARG pullRequestSourceBranch
ARG pullRequestTargetBranch

RUN if [ ! -z "${sonarProjectName}" ]; then \
     if [ -z "${pullRequestId}" ]; then \
        $HOME/.dotnet/tools/dotnet-sonarscanner begin \
          /k:$sonarProjectName \
          /d:sonar.host.url=$sonarUrl \
          /d:sonar.login=$sonarToken \
          /d:sonar.branch.name=$buildSourceBranchName \
          /d:sonar.cs.vstest.reportsPaths="/app/test_results/*.trx" \
          /d:sonar.cs.opencover.reportsPaths="/app/**/TestResults/opencover.xml" \
          /v:$version; \
      else \
        $HOME/.dotnet/tools/dotnet-sonarscanner begin \
          /k:${sonarProjectName} \
          /d:sonar.host.url=${sonarUrl} \
          /d:sonar.login=${sonarToken} \
          /d:sonar.cs.vstest.reportsPaths="/app/test_results/*.trx" \
          /d:sonar.cs.opencover.reportsPaths="/app/**/TestResults/opencover.xml" \
          /d:sonar.pullrequest.key=${pullRequestId} \
          /d:sonar.pullrequest.branch=${pullRequestSourceBranch} \
          /d:sonar.pullrequest.base=${pullRequestTargetBranch} \
          /v:${version}; \
     fi \
  fi

# build solution and prepare assemblies for following tasks
RUN dotnet build *.sln --configuration ${buildConfiguration} --no-restore

ENV TEST_RESULTS_FOLDER=/app/test_results

RUN if [ -f .coverageignore ]; then echo "file exists"; else echo "" > .coverageignore; fi

ARG coverageExclude=[NUnit3.TestAdapter]*

RUN tr -d '\015' <.coverageignore > .coverageignore_temp && \
  EXCLUDE_LIST=$(grep -v -e '^$\|^\s*\#' .coverageignore_temp | tr "," "\n" | xargs -i echo "/app/"{} | paste -sd ",") \
  && dotnet test \
    -r ${TEST_RESULTS_FOLDER} \
    --logger:trx \
    --no-build \
    --no-restore \
    /p:CollectCoverage=true \
    /p:CoverletOutput="./TestResults/opencover.xml" \
    /p:CoverletOutputFormat=opencover \
    /p:Exclude=\"${coverageExclude}\" \
    /p:ExcludeByFile="\"$EXCLUDE_LIST\"" \
    --configuration ${BUILD_CONFIGURATION} || exit 0

# merge all code coverage into a single report
ENV COVERAGE_MERGE_FOLDER=/app/test_coverage
ARG reportTypes=HtmlInline_AzurePipelines
RUN $HOME/.dotnet/tools/reportgenerator \
  "-reports:`find . -name "opencover.xml" | xargs echo | tr -s " " ";"`" -targetdir:$COVERAGE_MERGE_FOLDER \
  "-reportTypes:${reportTypes}" || exit 0

# End Sonarscanner
RUN if [ ! -z "${sonarProjectName}" ]; then \
    $HOME/.dotnet/tools/dotnet-sonarscanner end /d:sonar.login=${sonarToken}; \
  fi

# generate nuget packages if the parameter packEnabled is yes|true|1|on
ARG packEnabled=no
ARG nugetPublishFeed=
ARG nugetPublishApiKey=az
ENV APP_PACKAGES_FOLDER=/app/packages

RUN if [ "${packEnabled}" = "yes" ] || [ "${packEnabled}" = "true" ] || [ "${packEnabled}" = "1" ] || [ "${packEnabled}" = "on" ]; then \
    rm -f ${APP_PACKAGES_FOLDER}/*.nupkg && \
    dotnet pack --no-build -o ${APP_PACKAGES_FOLDER} -p:PackageVersion=${version} --configuration ${buildConfiguration} && \
    find ${APP_PACKAGES_FOLDER} -name '*.nupkg' | xargs -i dotnet nuget push {} --api-key ${nugetPublishApiKey} --source "${nugetPublishFeed}"; \
  else \
    echo "no packages generated" ; \
  fi

# create entrypoint to export all tests results with coverage and packages to host
ENV OUTPUT_FOLDER=/app/_output
ENTRYPOINT cp -r ${COVERAGE_MERGE_FOLDER} ${OUTPUT_FOLDER} \
  && cp -r ${TEST_RESULTS_FOLDER} ${OUTPUT_FOLDER} \
  && chmod -R 777 ${OUTPUT_FOLDER}
