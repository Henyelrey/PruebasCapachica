pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(true)   // ⬅️ Desactiva el "Declarative: Checkout SCM" automático
  }

  environment {
    COMPOSER_PROCESS_TIMEOUT = '1800'
  }

  stages {

    stage('Checkout') {
      steps {
        deleteDir() // limpia el workspace
        // Clone explícito (robusto). Requiere credencial 'github-pat'
        git branch: 'main',
            credentialsId: 'github-pat',
            url: 'https://github.com/Henyelrey/PruebasCapachica.git'
      }
    }

    stage('Test + Coverage (Docker PHP 8.3)') {
      agent {
        docker {
          image 'php:8.3-cli'
          args '-u root'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -euxo pipefail
          apt-get update
          apt-get install -y git unzip libzip-dev zlib1g-dev curl
          docker-php-ext-install zip

          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

          pecl install xdebug || true
          docker-php-ext-enable xdebug || true

          php -v
          composer -V

          mkdir -p coverage
          composer install --no-interaction --prefer-dist

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
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            sh "${scannerHome}/bin/sonar-scanner"
            // Si no tienes sonar-project.properties, usa el bloque CLI comentado que te pasé antes.
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        script {
          timeout(time: 10, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') error "Quality Gate failed: ${qg.status}"
          }
        }
      }
    }
  }

  post {
    always {
      script {
        try {
          node {
            cleanWs deleteDirs: true, notFailBuild: true
          }
        } catch (e) {
          echo "Omitiendo cleanWs (no workspace disponible): ${e.message}"
        }
      }
    }
  }
}
