pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(true)   // evita el "Declarative: Checkout SCM" automático
  }

  environment {
    COMPOSER_PROCESS_TIMEOUT = '1800'
    PROJECT_DIR = 'turismo-backend'   // ⬅️ tu proyecto PHP vive aquí
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        git branch: 'main',
            credentialsId: 'github-pat',
            url: 'https://github.com/Henyelrey/PruebasCapachica.git'

        // sanity check
        sh '''
          set -eux
          test -f "$PROJECT_DIR/composer.json" || { echo "No existe $PROJECT_DIR/composer.json"; ls -la; exit 1; }
          echo "OK: encontrado $PROJECT_DIR/composer.json"
        '''
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
          cd "$PROJECT_DIR"

          apt-get update
          apt-get install -y git unzip libzip-dev zlib1g-dev curl
          docker-php-ext-install zip

          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

          # Xdebug para coverage (si falla, no tumbar el build)
          pecl install xdebug || true
          docker-php-ext-enable xdebug || true

          php -v
          composer -V

          mkdir -p coverage
          composer install --no-interaction --prefer-dist

          # usar config si existe
          CFG=''
          [ -f phpunit.xml ] && CFG='-c phpunit.xml'
          [ -f phpunit.xml.dist ] && CFG='-c phpunit.xml.dist'

          php -d xdebug.mode=coverage vendor/bin/phpunit $CFG \
            --coverage-clover coverage/clover.xml \
            --log-junit coverage/junit.xml
        '''
      }
      post {
        always {
          // busca reports dentro del subdirectorio
          junit testResults: '**/coverage/junit.xml', allowEmptyResults: true
          archiveArtifacts artifacts: '**/coverage/*.xml', fingerprint: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube-Server') {
          script {
            def scannerHome = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            sh """
              set -euxo pipefail
              cd "\$PROJECT_DIR"
              if [ -f sonar-project.properties ]; then
                "${scannerHome}/bin/sonar-scanner"
              else
                "${scannerHome}/bin/sonar-scanner" \\
                  -Dsonar.projectKey=pruebas-capachica \\
                  -Dsonar.projectName=PruebasCapachica \\
                  -Dsonar.sourceEncoding=UTF-8 \\
                  -Dsonar.sources=app \\
                  -Dsonar.tests=tests \\
                  -Dsonar.php.coverage.reportPaths=coverage/clover.xml \\
                  -Dsonar.junit.reportPaths=coverage/junit.xml
              fi
            """
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
