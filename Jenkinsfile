pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(true)
  }

  environment {
    COMPOSER_PROCESS_TIMEOUT = '1800'
    PROJECT_DIR = 'turismo-backend'   // tu proyecto PHP vive aquí
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        git branch: 'main',
            credentialsId: 'github-pat',
            url: 'https://github.com/Henyelrey/PruebasCapachica.git'

        sh '''
          set -eux
          test -f "$PROJECT_DIR/composer.json" || { echo "No existe $PROJECT_DIR/composer.json"; ls -la; exit 1; }
        '''
      }
    }

    stage('Test + Coverage (Docker PHP 8.3)') {
      // si tus tests tardan más, sube este timeout sólo para este stage
      options { timeout(time: 25, unit: 'MINUTES') }
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
          apt-get install -y git unzip libzip-dev zlib1g-dev curl libicu-dev
          docker-php-ext-install zip intl

          # DB para testing: SQLite
          docker-php-ext-install pdo_sqlite sqlite3

          # (opcional si usas otras features en tests)
          # docker-php-ext-install bcmath

          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

          pecl install xdebug || true
          docker-php-ext-enable xdebug || true

          php -v
          php -m | sort
          composer -V

          # === Entorno de pruebas Laravel (.env.testing) ===
          cat > .env.testing <<'EOF'
APP_ENV=testing
APP_DEBUG=true
APP_KEY=
CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array

# SQLite file (más estable que :memory: para procesos con cobertura)
DB_CONNECTION=sqlite
DB_DATABASE=/tmp/testing.sqlite
EOF

          # Genera APP_KEY para testing
          touch /tmp/testing.sqlite
          php artisan key:generate --env=testing --force

          # Dependencias del proyecto
          composer install --no-interaction --prefer-dist

          # Limpia y migra la BD de testing (si usas RefreshDatabase igual ayuda)
          php artisan config:clear --env=testing
          php artisan cache:clear  --env=testing || true
          php artisan migrate --env=testing --force

          mkdir -p coverage

          # Usa phpunit.xml si existe
          CFG=''
          [ -f phpunit.xml ] && CFG='-c phpunit.xml'
          [ -f phpunit.xml.dist ] && CFG='-c phpunit.xml.dist'

          # Ejecuta tests con cobertura (si hay demasiados errores, puedes agregar --stop-on-error)
          php -d xdebug.mode=coverage vendor/bin/phpunit $CFG \
            --coverage-clover coverage/clover.xml \
            --log-junit coverage/junit.xml
        '''
      }
      post {
        always {
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
