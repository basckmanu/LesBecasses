variable "cloudflare_api_token" {
  description = "Token API Cloudflare (droits minimaux : DNS, R2, D1, Workers)"
  type        = string
  sensitive   = true
}

variable "account_id" {
  type = string
}

variable "zone_id" {
  description = "Zone du domaine principal"
  type        = string
}

variable "domain" {
  description = "Domaine principal, ex. exemple.fr"
  type        = string
}
