pipeline {
    agent any

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build and Unit Tests') {
            steps {
                bat 'cd frontend && npm install && npm run build'
                bat 'xcopy /E /I /Y frontend\\build backend\\build'
            }
        }

        stage('Build Docker Image and Push to Artifactory') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Approve Dev Deployment') {
            steps {
                input message: 'Deploy to Dev?', ok: 'Approve'
            }
        }

        stage('Create and Deploy to Dev Environment') {
            steps {
                bat 'docker-compose down --remove-orphans'
                bat 'docker-compose up -d'
            }
        }

    }

    post {
        success {
            echo 'Pipeline successful! App is running at http://localhost:3000'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}