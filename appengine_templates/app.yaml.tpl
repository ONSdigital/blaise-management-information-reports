service: mir-ui
runtime: nodejs24

entrypoint: node ./build/server/server/index.js

vpc_access_connector:
  name: _VPC_CONNECTOR

env_variables:
  PORT: "8080"
  PROJECT_ID: _PROJECT_ID
  BERT_URL: _BERT_URL
  BERT_CLIENT_ID: _BERT_CLIENT_ID
  BLAISE_API_URL: _BLAISE_API_URL
  URL_DOMAIN: _URL_DOMAIN
  SERVER_PARK: _SERVER_PARK
  SESSION_SECRET: _SESSION_SECRET

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION