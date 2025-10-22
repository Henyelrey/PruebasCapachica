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
    COMPOSER_MEMORY_LIMIT = '-1'
    PROJECT_DIR = 'turismo-backend'

    DB_CONNECTION = 'mysql'
    DB_HOST = '10.144.207.152'
    DB_PORT = '3306'
    DB_DATABASE = 'turismobackend_test'
    DB_USERNAME = 'nick'
    DB_PASSWORD = 'nick123'

    APP_ENV = 'testing'
    APP_DEBUG = 'true'
    APP_KEY = 'base64:VNw8bkkhaDoZEijO3hBuD3uJUrE+Yr7eRqfth3pEJ4U='
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
          echo "OK: encontrado $PROJECT_DIR/composer.json"
        '''
      }
    }

    stage('Test + Coverage (Docker PHP 8.3 + MySQL)') {
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
          apt-get install -y git unzip libzip-dev zlib1g-dev curl default-mysql-client libicu-dev
          docker-php-ext-install zip intl pdo_mysql

          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

          pecl install xdebug || true
          docker-php-ext-enable xdebug || true

          php -v
          php -m | sort
          composer -V

          # Esperar a MySQL
          for i in $(seq 1 60); do
            if mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; then
              echo "MySQL OK"; break
            fi
            echo "Esperando MySQL ($i/60)..."
            sleep 2
          done

          # Generar .env.testing
          cat > .env.testing <<EOF
APP_ENV=${APP_ENV}
APP_DEBUG=${APP_DEBUG}
APP_KEY=${APP_KEY}
CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array
MAIL_MAILER=array

DB_CONNECTION=${DB_CONNECTION}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
EOF

          composer install --no-interaction --prefer-dist

          php artisan config:clear --env=testing
          php artisan cache:clear --env=testing || true

          # Crear BD si no existe (sin backticks ni escapes)
          mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" \
            -e "CREATE DATABASE IF NOT EXISTS ${DB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true

          php artisan migrate --env=testing --force

          mkdir -p coverage

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
                "\${scannerHome}/bin/sonar-scanner"
              else
                "\${scannerHome}/bin/sonar-scanner" \\
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
