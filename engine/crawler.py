import os
import json
import boto3
from datetime import datetime, timezone

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "verishield")

def get_client():
    return boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))

def write_alert(table, finding: dict):
    item = {
        "PK": f"ALERT#{finding['id']}",
        "SK": "METADATA",
        "asset": finding["asset"],
        "domain": finding["domain"],
        "violation": finding["violation"],
        "severity": finding["severity"],
        "impact": finding["impact"],
        "impressions": finding["impressions"],
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "status": "new",
        "ttl": int(datetime.now(timezone.utc).timestamp()) + 2592000,
    }
    table.put_item(Item=item)
    print(f"  ✓ Alert written for {finding['domain']}")

def crawl():
    client = get_client()
    table = client.Table(TABLE_NAME)

    dummy_findings = [
        {
            "id": "alert-001",
            "asset": "Summer Collection — Hero Shot",
            "domain": "luxewear.com",
            "violation": "Unauthorized Replica",
            "severity": "critical",
            "impact": "Sold at $29.99 — 58% below MSRP",
            "impressions": "12.4K",
        },
        {
            "id": "alert-002",
            "asset": "Summer Collection — Hero Shot",
            "domain": "shopmart.io",
            "violation": "MAP Violation",
            "severity": "warning",
            "impact": "Listed at $39.99 — MSRP $79.99",
            "impressions": "4.2K",
        },
    ]

    print(f"Scanning {len(dummy_findings)} known targets...")
    for finding in dummy_findings:
        write_alert(table, finding)
    print("Done.")

if __name__ == "__main__":
    crawl()
