# Configure the Cloudflare provider using the required_providers stanza
# required with Terraform 0.13 and beyond. You may optionally use version
# directive to prevent breaking changes occurring unannounced.
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  email   = "kirkilese@gmail.com"
  api_key = var.cloudflare_api_key
}


/* --------------------------------- API Key -------------------------------- */
// Creates an API token for the preview environment to use for purging the cache

data "cloudflare_user" "me" {}

data "cloudflare_zone" "main" {
  name       = var.cloudflare_domain
  account_id = var.cloudflare_account_id
}

data "cloudflare_api_token_permission_groups" "main" {}

resource "cloudflare_api_token" "deploy" {
  name = "${var.cloudflare_project_name} - Deploy"

  policy {
    permission_groups = [
      data.cloudflare_api_token_permission_groups.main.account["Pages Write"],
      data.cloudflare_api_token_permission_groups.main.account["Mass URL Redirects Write"],
      data.cloudflare_api_token_permission_groups.main.account["Workers R2 Storage Write"],
      data.cloudflare_api_token_permission_groups.main.account["Account Rule Lists Write"],
      data.cloudflare_api_token_permission_groups.main.user["API Tokens Write"],
      data.cloudflare_api_token_permission_groups.main.user["API Tokens Read"],
      data.cloudflare_api_token_permission_groups.main.user["User Details Read"],
      data.cloudflare_api_token_permission_groups.main.zone["Config Settings Write"],
      data.cloudflare_api_token_permission_groups.main.zone["Cache Settings Write"],
      data.cloudflare_api_token_permission_groups.main.zone["Zone Settings Write"],
      data.cloudflare_api_token_permission_groups.main.zone["Dynamic URL Redirects Write"],
      data.cloudflare_api_token_permission_groups.main.zone["Zone Write"],
      data.cloudflare_api_token_permission_groups.main.zone["DNS Write"],
      data.cloudflare_api_token_permission_groups.main.zone["Cache Purge"],
      data.cloudflare_api_token_permission_groups.main.r2["Workers R2 Storage Bucket Item Read"],
      data.cloudflare_api_token_permission_groups.main.r2["Workers R2 Storage Bucket Item Write"]
    ]
    resources = {
      "com.cloudflare.api.user.${data.cloudflare_user.me.id}"                = "*"
      "com.cloudflare.api.account.${var.cloudflare_account_id}"              = "*"
      "com.cloudflare.api.account.zone.${data.cloudflare_zone.main.zone_id}" = "*"
    }
  }
}