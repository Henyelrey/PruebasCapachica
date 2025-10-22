pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    COMPOSER_PROCESS_TIMEOUT = '1800'
    COMPOSER_CACHE_DIR = "${WORKSPACE}\\.composer-cache"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[
            url: 'https://github.com/Henyelrey/PruebasCapachica.git',
            credentialsId: 'github-pat'
          ]]
        ])
      }
    }

    stage('Prep') {
      steps {
        bat 'php -v'
        bat 'composer -V'
        bat 'php -m | findstr /I xdebug'
        bat 'if not exist coverage mkdir coverage'
        bat 'composer install --no-interaction --prefer-dist'
      }
    }

    stage('Test + Coverage') {
      steps {
        // genera coverage\\clover.xml y coverage\\junit.xml
        bat 'php -d xdebug.mode=coverage vendor\\bin\\phpunit -c phpunit.xml --coverage-clover coverage\\clover.xml --log-junit coverage\\junit.xml'
      }
      post {
        always {
          junit testResults: 'coverage/junit.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'coverage/*.xml', fingerprint: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube-Server') {
          // usa sonar-project.properties en la raíz del repo
          bat 'sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        script {
          timeout(time: 10, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
              error "Quality Gate failed: ${qg.status}"
            }
          }
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}
