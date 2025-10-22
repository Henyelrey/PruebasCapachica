pipeline {
  agent any

  options { 
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    COMPOSER_PROCESS_TIMEOUT = '1800'
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

    stage('Test + Coverage (Docker PHP 8.3)') {
      agent {
        docker {
          image 'php:8.3-cli'
          args '-u root'         // Necesario para apt-get y pecl
          reuseNode true         // Reutiliza el workspace del nodo
        }
      }
      steps {
        sh '''
          set -euxo pipefail
          apt-get update
          apt-get install -y git unzip libzip-dev zlib1g-dev curl
          docker-php-ext-install zip

          # Composer
          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

          # Xdebug (opcional para coverage)
          pecl install xdebug || true
          docker-php-ext-enable xdebug || true

          php -v
          composer -V

          mkdir -p coverage
          composer install --no-interaction --prefer-dist

          # Coverage
          php -d xdebug.mode=coverage vendor/bin/phpunit -c phpunit.xml \
            --coverage-clover coverage/clover.xml \
            --log-junit coverage/junit.xml
        '''
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
          script {
            // Usa la herramienta SonarScanner configurada en Manage Jenkins > Tools (llámala exactamente así)
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            sh "${scannerHome}/bin/sonar-scanner"
          }
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
      // Limpieza opcional del workspace
      cleanWs deleteDirs: true, notFailBuild: true
    }
  }
}
