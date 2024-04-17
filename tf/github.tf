# Provides synchronization between the Terraform deployment and the GitHub
# environment. Note that the GitHub actions workflow itself runs Terraform
# apply statements, so if any values need changing they should be done
# locally / automatically instead of waiting to do them with the GitHub action.

data "github_repository" "main" {
  full_name = "evankirkiles/to-us-from-us"
}

/* --------------------------------- Secrets -------------------------------- */

resource "github_actions_secret" "sanity_preview_secret" {
  repository      = data.github_repository.main.name
  secret_name     = "SANITY_PREVIEW_SECRET"
  plaintext_value = var.sanity_preview_secret
}

resource "github_actions_secret" "sanity_api_read_token" {
  repository      = data.github_repository.main.name
  secret_name     = "SANITY_API_READ_TOKEN"
  plaintext_value = var.sanity_api_read_token
}

resource "github_actions_secret" "cloudflare_api_token" {
  repository      = data.github_repository.main.name
  secret_name     = "CLOUDFLARE_API_TOKEN"
  plaintext_value = var.cloudflare_api_token
}

/* -------------------------------- Variables ------------------------------- */

resource "github_actions_variable" "cloudflare_account_id" {
  repository    = data.github_repository.main.name
  variable_name = "CLOUDFLARE_ACCOUNT_ID"
  value         = var.cloudflare_account_id
}

resource "github_actions_variable" "cloudflare_project_name_prefix" {
  repository    = data.github_repository.main.name
  variable_name = "CLOUDFLARE_PROJECT_NAME_PREFIX"
  value         = var.cloudflare_project_name_prefix
}


resource "github_actions_variable" "sanity_studio_project_id" {
  repository    = data.github_repository.main.name
  variable_name = "SANITY_STUDIO_PROJECT_ID"
  value         = var.sanity_studio_project_id
}

resource "github_actions_variable" "sanity_studio_dataset" {
  repository    = data.github_repository.main.name
  variable_name = "SANITY_STUDIO_DATASET"
  value         = var.sanity_studio_dataset
}


resource "github_actions_variable" "sanity_studio_api_version" {
  repository    = data.github_repository.main.name
  variable_name = "SANITY_STUDIO_API_VERSION"
  value         = var.sanity_studio_api_version
}