output "cf_deploy_api_token" {
  value     = cloudflare_api_token.deploy.value
  sensitive = true
}
