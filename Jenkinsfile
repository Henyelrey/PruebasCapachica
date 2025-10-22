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
        // Asegura que no queden restos de un .git roto o workspace parcial
        deleteDir()
        // Checkout simple y robusto (equivale a un "git clone")
        git branch: 'main',
            credentialsId: 'github-pat',
            url: 'https://github.com/Henyelrey/PruebasCapachica.git'
      }
    }

    stage('Test + Coverage (Docker PHP 8.3)') {
      agent {
        docker {
          image 'php:8.3-cli'
          args '-u root'         // necesario para apt-get/pecl en el contenedor de pruebas
          reuseNode true         // reusar workspace para acelerar
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

          # Xdebug (opcional; no fallar si no compila)
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
            // Usa la herramienta SonarScanner registrada en Manage Jenkins > Tools con este nombre
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            sh """
              ${scannerHome}/bin/sonar-scanner
            """
            // Si NO tienes sonar-project.properties en el repo, usa esto en su lugar:
            // sh """
            //   ${scannerHome}/bin/sonar-scanner \
            //     -Dsonar.projectKey=pruebas-capachica \
            //     -Dsonar.projectName=PruebasCapachica \
            //     -Dsonar.sources=app \
            //     -Dsonar.tests=tests \
            //     -Dsonar.sourceEncoding=UTF-8 \
            //     -Dsonar.php.coverage.reportPaths=coverage/clover.xml \
            //     -Dsonar.junit.reportPaths=coverage/junit.xml
            // """
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

  // Importante: si el pipeline falla ANTES de asignar un node/workspace,
  // cleanWs lanza MissingContextVariable. Lo protegemos.
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
