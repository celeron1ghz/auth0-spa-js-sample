variable "auth0_domain" {}
variable "auth0_client_id" {}
variable "auth0_client_secret" {}

variable "application_name" { default = "Test" }
variable "application_domain" { default = "https://example.com" }

provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
}

resource "auth0_client" "app" {
  name                  = var.application_name
  description           = "(Managed by Terraform)"
  app_type              = "spa"
  is_first_party        = true
  oidc_conformant       = true
  callbacks             = [ "${var.application_domain}/callback" ]
  allowed_origins       = [ var.application_domain ]
  allowed_logout_urls   = [ var.application_domain ]
  web_origins           = [ var.application_domain ]
  grant_types           = [ "authorization_code", "implicit", "refresh_token" ]
  custom_login_page_on  = true
  token_endpoint_auth_method = "none"
  is_token_endpoint_ip_header_trusted = false

  jwt_configuration {
    lifetime_in_seconds = 36000
    secret_encoded = true
    alg = "RS256"
  }
}

resource "auth0_resource_server" "api" {
  name        = "${var.application_name} (Managed by Terraform)"
  identifier  = "https://api.example.com"
  signing_alg = "RS256"

  scopes {
    value       = "create:foo"
    description = "Create foos"
  }

  scopes {
    value       = "create:bar"
    description = "Create bars"
  }

  allow_offline_access                            = false
  token_lifetime                                  = 86400
  skip_consent_for_verifiable_first_party_clients = true
}

resource "auth0_rule" "rule1" {
  name = "inject-twitter-screen-name"
  enabled = true
  script = file("rule01.js")
}

resource "auth0_rule" "rule2" {
  name = "inject-role-data"
  enabled = true
  script = file("rule02.js")
}

