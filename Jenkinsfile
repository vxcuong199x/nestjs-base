pipeline {
    agent any
    environment {
        CHART_REPO = "${GIT_URL.replaceAll('.*/([^/]+/[^/]+)\\.git', '$1').tokenize('/').pop()}"
        imageTag = sh(script: "cat ${env.WORKSPACE}/helm-chart/values.yaml | grep 'tag:' | awk '{print \$2}'", returnStdout: true).trim()
        DOCKER_IMAGE = "hub.spilot.io:8843/${CHART_REPO}/${CHART_REPO}"
        DOCKER_TAG = "${imageTag}-${GIT_COMMIT.substring(0,7)}"
        COMMIT = "${GIT_COMMIT.substring(0,7)}"
        URL_REGISTRY = "https://hub.spilot.io:8843"
        URL_ARGOCD_STG = "172.16.10.164:30888"
        ACCOUNT_ARGO_STG = "bic-argocd"
        HELM_REPO = "hub.spilot.io:8843/${CHART_REPO}"
        ACCOUNT_HARBOR = "bic-harbor"
        ACCOUNT_ADD_REPO = "add-repo-argocd"
        APP_NAME = "${GIT_URL.replaceAll('.*/([^/]+/[^/]+)\\.git', '$1').tokenize('/').pop()}"
        APP_PROJECT = "default"
        HELM_VERSION = "0.${BUILD_NUMBER}.0"
        APP_NAMESPACE = "nkc"
        K8S_SERVER = "https://kubernetes.default.svc"
        URL_HELM_PUSH = "oci://hub.spilot.io:8843/${CHART_REPO}"
        PATH_WORKDIR = "helm-chart"
    }
    stages {
        stage("registry-login") {
            steps {
                withCredentials([usernamePassword(credentialsId: env.ACCOUNT_HARBOR, passwordVariable: 'HARBOR_PASSWORD', usernameVariable: 'HARBOR_USERNAME')]) {
                    sh '''
                    docker login ${URL_REGISTRY} -u ${HARBOR_USERNAME} -p ${HARBOR_PASSWORD}
                    '''
                }
            }
        }
        stage("helm-package") {
            steps {
                    sh '''
                    export HELM_EXPERIMENTAL_OCI=1
                    helm package ./${PATH_WORKDIR} --version 0.${BUILD_NUMBER}.0
                    helm push ${APP_NAME}-0.${BUILD_NUMBER}.0.tgz ${URL_HELM_PUSH}
                    rm -rf ${APP_NAME}-0.${BUILD_NUMBER}.0.tgz
                    '''
            }
        }
        stage("build-images") {
            steps {
                sh '''
                docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                '''
            }
        }
        stage("push-images") {
            steps {
                sh '''
                docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }  
        stage("clear-images") {
            steps {
                sh '''
                docker image rm ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }
        stage("login-argocd") {
            steps {
                withCredentials([usernamePassword(credentialsId: env.ACCOUNT_ARGO_STG, passwordVariable: 'ARGO_STG_PASSWORD', usernameVariable: 'ARGO_STG_USERNAME')]) {
                    sh '''
                    argocd login ${URL_ARGOCD_STG} --username ${ARGO_STG_USERNAME} --password ${ARGO_STG_PASSWORD} --insecure
                    '''
                }
            }
        }
        stage("add-repo-argocd") {
            steps {
                withCredentials([usernamePassword(credentialsId: env.ACCOUNT_ADD_REPO, passwordVariable: 'ACCOUNT_ADD_REPO_PASSWORD', usernameVariable: 'ACCOUNT_ADD_REPO_USERNAME')]) {
                    sh '''
                    argocd repo add ${HELM_REPO} --type helm --name stable --enable-oci --username ${ACCOUNT_ADD_REPO_USERNAME} --password ${ACCOUNT_ADD_REPO_PASSWORD}
                    '''
                }
            }
        }
        stage("deploy-app") {
            steps {
                sh '''
                argocd app create ${APP_NAME} --repo ${HELM_REPO} --project ${APP_PROJECT} --revision ${HELM_VERSION} --helm-chart ${CHART_REPO} --dest-namespace ${APP_NAMESPACE} --helm-set image.tag=${DOCKER_TAG} --dest-server ${K8S_SERVER} --sync-policy automated --auto-prune --self-heal --upsert
                '''
            }
        }
    }
}
