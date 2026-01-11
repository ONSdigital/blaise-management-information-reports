service: mir-ui
runtime: nodejs20

vpc_access_connector:
  name: _VPC_CONNECTOR

env_variables:
  PROJECT_ID: _PROJECT_ID
  BERT_URL: _BERT_URL
  BERT_CLIENT_ID: _BERT_CLIENT_ID
  BLAISE_API_URL: _BLAISE_API_URL
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION
