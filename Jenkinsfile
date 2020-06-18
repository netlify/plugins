pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '1'))
    timestamps()
  }

  stages {
    stage("Docker push to registry") {
      steps {
        withCredentials([file(credentialsId: 'google-container-registry-push', variable: 'GCLOUD_SECRET_FILE')]) {
          sh "script/docker-build.sh $GCLOUD_SECRET_FILE ${env.GIT_COMMIT} ${env.BRANCH_NAME}"
        }
      }
    }
  }

  post {
    failure {
      slackSend color: "danger", message: "Build failed - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}/console|Open>)"
    }
    success {
      slackSend color: "good", message: "Build succeeded - ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}/console|Open>)"
    }
  }
}
