#!/usr/bin/env bash

set -e
set -x

GCLOUD_FILE="$1"
GIT_COMMIT="$2"
BRANCH_NAME="$3"

BRANCH_TAG="gcr.io/netlify-services/github-netlify-build-image-plugins:${BRANCH_NAME//\//-}"
COMMIT_TAG="gcr.io/netlify-services/github-netlify-build-image-plugins:$GIT_COMMIT"

docker build -t "${BRANCH_TAG}" .
docker tag ${BRANCH_TAG} ${COMMIT_TAG}

if [ ! -d ${HOME}/google-cloud-sdk ]; then
  curl https://sdk.cloud.google.com | bash;
fi
source ${HOME}/google-cloud-sdk/path.bash.inc

gcloud auth activate-service-account --key-file "${GCLOUD_FILE}"

gcloud docker -- push "${BRANCH_TAG}"
gcloud docker -- push "${COMMIT_TAG}"
