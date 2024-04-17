# Provides synchronization between the Terraform deployment and the GitHub
# environment. Note that the GitHub actions workflow itself runs Terraform
# apply statements, so if any values need changing they should be done
# locally / automatically instead of waiting to do them with the GitHub action.

data "github_repository" "main" {
  full_name = "evankirkiles/to-us-from-us"
}

locals {
  gh_secrets = {
    "SANITY_PREVIEW_SECRET" = var.sanity_preview_secret
    "SANITY_API_READ_TOKEN" = var.sanity_api_read_token
    "CLOUDFLARE_API_TOKEN"  = var.cloudflare_api_token
    "CLOUDFLARE_DOMAIN"     = var.cloudflare_domain
    "SCOPED_GITHUB_PAT"     = var.scoped_github_pat
  }

  gh_variables = {
    "CLOUDFLARE_ACCOUNT_ID"          = var.cloudflare_account_id
    "CLOUDFLARE_PROJECT_NAME_PREFIX" = var.cloudflare_project_name_prefix
    "SANITY_STUDIO_PROJECT_ID"       = var.sanity_studio_project_id
    "SANITY_STUDIO_DATASET"          = var.sanity_studio_dataset
    "SANITY_STUDIO_API_VERSION"      = var.sanity_studio_api_version
  }
}

resource "github_actions_secret" "secrets" {
  repository      = data.github_repository.main.name
  secret_name     = each.key
  plaintext_value = local.gh_secrets[each.key]
  for_each        = toset(keys(local.gh_secrets))
}

resource "github_actions_variable" "variables" {
  repository    = data.github_repository.main.name
  variable_name = each.key
  value         = local.gh_variables[each.key]
  for_each      = toset(keys(local.gh_variables))
}
