output "cf_proj_name_prod" {
  value = cloudflare_pages_project.production.name
}

output "cf_proj_name_preview" {
  value = cloudflare_pages_project.preview.name
}

output "production_url" {
  value = local.prod_url
}

output "admin_url" {
  value = local.admin_url
}

output "cf_zone_id" {
  value = data.cloudflare_zone.main.zone_id
}
