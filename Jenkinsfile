pipeline {
    agent any

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
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main', credentialsId: 'githubtoken2', url: 'https://github.com/Henyelrey/PruebasCapachica.git'
                }
            }
        }

        stage('Setup Tools') {
            steps {
                echo "Instalando PHP, extensiones y Composer en el agente host..."
                sh '''
                    sudo apt-get update && sudo apt-get install -y git php-cli php-mysql curl

                    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
                    php composer-setup.php --install-dir=/usr/local/bin --filename=composer
                    php -r "unlink('composer-setup.php');"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    sh '''
                        echo "Instalando dependencias con Composer..."
                        # Ahora Composer está disponible globalmente gracias a la etapa anterior
                        composer install --no-interaction --prefer-dist --optimize-autoloader
                    '''
                }
            }
        }

        stage('Build & Key Generation') {
            steps {
                echo "Optimizando cachés y generando llave de aplicación..."
                sh '''
                    # Limpieza de caché
                    php artisan config:clear
                    php artisan cache:clear
                    php artisan route:clear
                    php artisan view:clear
                    
                    # Generación de la llave de aplicación (CRUCIAL para Laravel)
                    php artisan key:generate
                    
                    # Optimización
                    php artisan config:cache
                '''
            }
        }

        stage('Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Preparando base de datos de prueba y ejecutando PHPUnit..."
                    sh '''
                        # Ejecutar migraciones
                        php artisan migrate --force --no-interaction
                        # Ejecutar pruebas
                        ./vendor/bin/phpunit --configuration phpunit.xml --testdox
                    '''
                }
            }
            post {
                always {
                    // Recoger reportes JUnit
                    junit 'tests/_reports/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return fileExists('sonar-project.properties') }
            }
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
            when {
                expression { return fileExists('sonar-project.properties') }
            }
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
        success {
            echo "Pipeline 'Capachica' ejecutado correctamente."
        }
        failure {
            echo "Error en el pipeline 'Capachica'."
        }
    }
}