terraform {
  required_version = ">= 1.6"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
  # TODO Infra : choisir un backend distant pour le state (ex. bucket R2 compatible S3)
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
