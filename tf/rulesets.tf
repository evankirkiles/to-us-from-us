/* ------------------------------ Bulk Redirect ----------------------------- */

// Bulk Redirect (Account-level)
resource "cloudflare_ruleset" "bulk_redirect" {
  account_id  = var.cloudflare_account_id
  name        = "Disable Preview Domains"
  description = "Redirects all *.pages.dev domains back to their custom domain."
  kind        = "root"
  phase       = "http_request_redirect"

  rules {
    action = "redirect"
    action_parameters {
      from_list {
        name = cloudflare_list.to-us-from-us.name
        key  = "http.request.full_uri"
      }
    }
    expression  = "http.request.full_uri in ${"$"}${replace(var.cloudflare_project_name_prefix, "-", "_")}_preview_redirect"
    description = "Apply redirects from redirect list"
    enabled     = true
  }
}

// List for Bulk Redirect
resource "cloudflare_list" "to-us-from-us" {
  account_id  = var.cloudflare_account_id
  name        = "${replace(var.cloudflare_project_name_prefix, "-", "_")}_preview_redirect"
  description = "Redirects *.pages.dev preview domains back to the custom domain."
  kind        = "redirect"

  item {
    value {
      redirect {
        source_url            = "${cloudflare_pages_project.preview.domains[0]}/"
        target_url            = "https://${cloudflare_pages_domain.preview.domain}"
        include_subdomains    = "enabled"
        subpath_matching      = "enabled"
        preserve_query_string = "disabled"
        preserve_path_suffix  = "disabled"
      }
    }
  }

  item {
    value {
      redirect {
        source_url            = "${cloudflare_pages_project.production.domains[0]}/"
        target_url            = "https://${cloudflare_pages_domain.production.domain}"
        include_subdomains    = "enabled"
        subpath_matching      = "enabled"
        preserve_query_string = "disabled"
        preserve_path_suffix  = "disabled"
      }
    }
  }
}

/* -------------------------- Caching / Page Rules -------------------------- */
// Prevent any access through pages.dev subdomains

resource "cloudflare_ruleset" "production" {
  zone_id     = data.cloudflare_zone.main.zone_id
  name        = "Cache Everything"
  description = "Enables caching for HTML resources"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules {
    action      = "set_cache_settings"
    expression  = "(http.host eq \"${var.cloudflare_domain}\")"
    description = "Enable caching for dynamic resources as well (HTML)"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 31536000
      }
      browser_ttl {
        mode    = "override_origin"
        default = 14400
      }
      cache_key {
        cache_deception_armor      = true
        ignore_query_strings_order = true
        custom_key {
          query_string {
            exclude = ["*"]
          }
        }
      }
      serve_stale {
        disable_stale_while_updating = false
      }
    }
  }
}

/* ----------------------------- Redirect Rules ----------------------------- */
// Prevent unauthorized access to the main domain

resource "cloudflare_ruleset" "redirect" {
  zone_id     = data.cloudflare_zone.main.zone_id
  name        = "Redirect to Login"
  description = "Redirects unauthenticated users to the login page"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules {
    action = "redirect"
    action_parameters {
      from_value {
        status_code = 302
        target_url {
          value = "/login"
        }
        preserve_query_string = false
      }
    }
    # This is a hack to still allow unauthenticated users access to static files
    # (JS, CSS) but not the pages with data themselves
    expression = "(${join(" and ", [
      "not http.cookie contains \"tousfromus-auth=${var.auth_secret}\"",
      "http.host eq \"${var.cloudflare_domain}\"",
      "http.request.uri.path ne \"/login\"",
      "not starts_with(http.request.uri.path, \"/api\")",
      "not starts_with(http.request.uri.path, \"/admin\")",
      "not http.request.uri.path contains \".\"",
    ])})"
    description = "redirect back to login"
    enabled     = true
  }
}