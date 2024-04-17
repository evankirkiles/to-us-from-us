variable "cloudflare_project_name" {
  description = "A readable name for the project, for API token usage."
  type        = string
  nullable    = false
}

variable "cloudflare_account_id" {
  description = "The CloudFlare account to create resources under."
  type        = string
  nullable    = false
}

variable "cloudflare_domain" {
  description = "The domain for the project, e.g. asianartsinitiative.org."
  type        = string
  nullable    = false
}

variable "cloudflare_api_key" {
  description = "Your global CloudFlare API Key (from the dashboard)"
  type        = string
  sensitive   = true
  nullable    = false
}