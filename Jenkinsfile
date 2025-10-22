pipeline {
  agent 'any' // o "any" si el master es Linux y tiene Docker

  options { timestamps(); disableConcurrentBuilds(); timeout(time: 30, unit: 'MINUTES') }

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
          args '-u root' // para instalar paquetes
        }
      }
      steps {
        sh '''
          apt-get update
          apt-get install -y git unzip libzip-dev zlib1g-dev
          docker-php-ext-install zip
          curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
          pecl install xdebug
          docker-php-ext-enable xdebug
          php -v
          composer -V

          mkdir -p coverage
          composer install --no-interaction --prefer-dist
          php -d xdebug.mode=coverage vendor/bin/phpunit -c phpunit.xml --coverage-clover coverage/clover.xml --log-junit coverage/junit.xml
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
          sh 'sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        script {
          timeout(time: 10, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') { error "Quality Gate failed: ${qg.status}" }
          }
        }
      }
    }
  }
}
