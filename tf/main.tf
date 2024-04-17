# Configure the Cloudflare provider using the required_providers stanza
# required with Terraform 0.13 and beyond. You may optionally use version
# directive to prevent breaking changes occurring unannounced.
terraform {
  cloud {
    organization = "evankirkiles"
    workspaces {
      project = "to-us-from-us"
      name    = "to-us-from-us"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "github" {}

locals {
  prod_hostname = var.cloudflare_domain
  prod_url      = "https://${local.prod_hostname}"
  admin_url     = "https://admin.${var.cloudflare_domain}"

  preview_env_variables = {
    IS_PREVIEW_ENV            = "yes"
    SANITY_PRODUCTION_URL     = local.prod_url
    CLOUDFLARE_ZONE_ID        = data.cloudflare_zone.main.zone_id
    CLOUDFLARE_ACCOUNT_ID     = var.cloudflare_account_id
    CLOUDFLARE_R2_BUCKET_NAME = cloudflare_r2_bucket.cache.name
  }
  preview_secrets = {
    CLOUDFLARE_R2_ACCESS_KEY_ID     = cloudflare_api_token.runtime.id
    CLOUDFLARE_R2_SECRET_ACCESS_KEY = sha256(cloudflare_api_token.runtime.value)
    CLOUDFLARE_PURGE_API_TOKEN      = cloudflare_api_token.runtime.value
    SANITY_API_READ_TOKEN           = var.sanity_api_read_token
    SANITY_PREVIEW_SECRET           = var.sanity_preview_secret
  }
}

/* -------------------------------- Projects -------------------------------- */

// The main production SSR build of the site, with intense caching. There is no
// admin dashboard on the production build.
resource "cloudflare_pages_project" "production" {
  account_id        = var.cloudflare_account_id
  name              = "${var.cloudflare_project_name_prefix}-prod"
  production_branch = "main"

  deployment_configs {
    production {
      r2_buckets = {
        R2 = cloudflare_r2_bucket.cache.name
      }
      compatibility_date  = "2024-01-11"
      compatibility_flags = ["nodejs_compat"]
    }
    preview {
      r2_buckets = {
        R2 = cloudflare_r2_bucket.cache.name
      }
      compatibility_date  = "2024-01-11"
      compatibility_flags = ["nodejs_compat"]
    }
  }
}

// The site's preview environment—where drafted changes are able to be enabled
resource "cloudflare_pages_project" "preview" {
  account_id        = var.cloudflare_account_id
  name              = "${var.cloudflare_project_name_prefix}-preview"
  production_branch = "main"

  deployment_configs {
    production {
      environment_variables = local.preview_env_variables
      secrets               = local.preview_secrets
      compatibility_date    = "2024-01-11"
      compatibility_flags   = ["nodejs_compat"]
    }
    preview {
      environment_variables = local.preview_env_variables
      secrets               = local.preview_secrets
      compatibility_date    = "2024-01-11"
      compatibility_flags   = ["nodejs_compat"]
    }
  }
}

/* --------------------------------- Domains -------------------------------- */
// Configures the custom domains for each of the projects.

resource "cloudflare_pages_domain" "production" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.production.name
  domain       = local.prod_hostname
}

resource "cloudflare_pages_domain" "preview" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.preview.name
  domain       = "admin.${var.cloudflare_domain}"
}

/* ---------------------------------- Zones --------------------------------- */
// Adds CNAME records to link the custom domains with the pages projects.

data "cloudflare_zone" "main" {
  name       = var.cloudflare_domain
  account_id = var.cloudflare_account_id
}

resource "cloudflare_record" "production" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "@"
  type    = "CNAME"
  proxied = true
  value   = cloudflare_pages_project.production.domains[0]
}

resource "cloudflare_record" "preview" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "admin"
  type    = "CNAME"
  proxied = true
  value   = cloudflare_pages_project.preview.domains[0]
}

// Enable CloudFlare tiered cache
resource "cloudflare_tiered_cache" "main" {
  zone_id    = data.cloudflare_zone.main.zone_id
  cache_type = "smart"
}

// Create an R2 bucket for manual HTML caching instead of Cache Reserve
resource "cloudflare_r2_bucket" "cache" {
  account_id = var.cloudflare_account_id
  name       = "${var.cloudflare_project_name_prefix}-prod"
  location   = "ENAM"
}

/* --------------------------------- API Key -------------------------------- */
// Creates an API token for the preview environment to use for purging the cache

# User permissions
data "cloudflare_api_token_permission_groups" "main" {}

resource "cloudflare_api_token" "runtime" {
  name = "${var.cloudflare_project_name_prefix}-cache-purge"

  policy {
    permission_groups = [
      data.cloudflare_api_token_permission_groups.main.zone["Cache Purge"],
      data.cloudflare_api_token_permission_groups.main.r2["Workers R2 Storage Bucket Item Read"],
      data.cloudflare_api_token_permission_groups.main.r2["Workers R2 Storage Bucket Item Write"]
    ]
    resources = {
      "com.cloudflare.api.account.zone.${data.cloudflare_zone.main.zone_id}"                                  = "*"
      "com.cloudflare.edge.r2.bucket.${var.cloudflare_account_id}_default_${cloudflare_r2_bucket.cache.name}" = "*"
    }
  }
}