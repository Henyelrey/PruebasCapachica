pipeline {
    agent {
        docker {
            image 'php:8.2-fpm-alpine' // Imagen ligera y completa para Laravel
        }
    }

    environment {
        APP_ENV = 'testing'
        APP_DEBUG = 'true'

        DB_CONNECTION = 'mysql'
        DB_HOST = '192.168.31.233'
        DB_PORT = '3306'
        DB_DATABASE = 'turismobackend_test'
        DB_USERNAME = 'nick'
        DB_PASSWORD = 'nick123'

        SONARQUBE_ENV = 'Sonarqube'
    }

    stages {
        stage('Setup Tools') {
            steps {
                echo "Instalando Git y PDO MySQL dentro del contenedor Docker..."
                sh '''
                    apk add --no-cache git composer
                    docker-php-ext-install pdo_mysql
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo "Instalando dependencias de Laravel con Composer..."
                    sh 'composer install --no-interaction --prefer-dist --optimize-autoloader'
                }
            }
        }

        stage('Build & Key Generation') {
            steps {
                echo "Optimizando cachés y generando llave de aplicación..."
                sh '''
                    php artisan config:clear
                    php artisan cache:clear
                    
                    php artisan key:generate
                    
                    php artisan config:cache
                '''
            }
        }

        stage('Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Preparando base de datos de prueba y ejecutando PHPUnit..."
                    sh '''
                        php artisan migrate --force --no-interaction
                        ./vendor/bin/phpunit --configuration phpunit.xml --testdox
                    '''
                }
            }
            post {
                always {
                    junit 'tests/_reports/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            when { expression { return fileExists('sonar-project.properties') } }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        echo "Ejecutando análisis de SonarQube..."
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            when { expression { return fileExists('sonar-project.properties') } }
            steps {
                echo "Esperando validación de calidad de código..."
                sleep(10)
                timeout(time: 4, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy') {
            steps {
                timeout(time: 8, unit: 'MINUTES') {
                    echo "Desplegando aplicación Laravel Capachica..."
                    sh '''
                        php artisan migrate --force
                        php artisan serve --host=0.0.0.0 --port=8000 &
                    '''
                }
            }
        }
    }

    post {
        success { echo "Pipeline 'Capachica' ejecutado correctamente." }
        failure { echo "Error en el pipeline 'Capachica'." }
    }
}