/*
 * variables.tf
 * Author: Evan Kirkiles
 * Created on: Wed Sep 13 2023
 * 2023 Yale SWE 
 */

/* ------------------------------- Github PAT ------------------------------- */

variable "scoped_github_pat" {
  description = "The GitHub personal access token to use for updating repo secrets."
  type        = string
  sensitive   = true
  nullable    = false
}

/* ---------------------------- Cloudflare things --------------------------- */

variable "cloudflare_account_id" {
  description = "The CloudFlare account to create resources under."
  type        = string
  nullable    = false
}

variable "cloudflare_api_token" {
  description = "The API token to deploy into the CloudFlare account."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "cloudflare_project_name_prefix" {
  description = "The base project name to prefix all projects with."
  type        = string
  nullable    = false
}

variable "cloudflare_domain" {
  description = "The domain for the project, e.g. asianartsinitiative.org."
  type        = string
  nullable    = false
}

/* ------------------------------ Sanity Things ----------------------------- */

variable "sanity_preview_secret" {
  description = "The secret used in page functions to check if draftMode is active."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "sanity_api_read_token" {
  description = "The token used to validate preview mode."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "sanity_studio_project_id" {
  description = "The ID of the Sanity project."
  type        = string
  nullable    = false
}

variable "sanity_studio_dataset" {
  description = "The dataset to use for the Sanity Studio."
  type        = string
  default     = "production"
}

variable "sanity_studio_api_version" {
  description = "The API version to use for the Sanity Studio."
  type        = string
  default     = "2024-04-16"
}

/* ----------------------------- Authentication ----------------------------- */

variable "auth_secret" {
  description = "The secret used to verify authenticated users."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "auth_password" {
  description = "The password used to authenticate users."
  type        = string
  sensitive   = true
  nullable    = false
}