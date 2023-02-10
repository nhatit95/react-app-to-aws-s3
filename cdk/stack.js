"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const cdk = require("@aws-cdk/core");
const route53 = require("@aws-cdk/aws-route53");
const s3 = require("@aws-cdk/aws-s3");
const acm = require("@aws-cdk/aws-certificatemanager");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const targets = require("@aws-cdk/aws-route53-targets");
const deploy = require("@aws-cdk/aws-s3-deployment");
const WEB_APP_DOMAIN = "reactapp6.nhatnguyenit.link";
class Stack extends cdk.Stack {
    constructor(scope, id) {
        super(scope, id, {
            env: {
                account: "230638288020",
                region: "ap-southeast-2",
            },
        });
        // Get The Hosted Zone
        // const zone = route53.HostedZone.fromLookup(this, "Zone", {
        //   domainName: "nhatnguyenit.link",
        // });
        const zone = new route53.HostedZone(this, "HostedZone", {
            zoneName: "nhatnguyenit.link",
        });
        //Create S3 Bucket for our website
        const siteBucket = new s3.Bucket(this, "SiteBucket", {
            bucketName: WEB_APP_DOMAIN,
            websiteIndexDocument: "index.html",
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Create Certificate
        // const siteCertificateArn = new acm.DnsValidatedCertificate(
        //   this,
        //   "SiteCertificate",
        //   {
        //     domainName: WEB_APP_DOMAIN,
        //     hostedZone: zone,
        //     region: "ap-southeast-2", //standard for acm certs
        //   }
        // ).certificateArn;
        const siteCertificateArn = new acm.Certificate(this, "Certificate", {
            domainName: WEB_APP_DOMAIN,
            validation: acm.CertificateValidation.fromDns(zone),
        }).certificateArn;
        //Create CloudFront Distribution
        const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
            aliasConfiguration: {
                acmCertRef: siteCertificateArn,
                names: [WEB_APP_DOMAIN],
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
            },
            originConfigs: [
                {
                    customOriginSource: {
                        domainName: siteBucket.bucketWebsiteDomainName,
                        originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                        },
                    ],
                },
            ],
        });
        //Create A Record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: WEB_APP_DOMAIN,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
            zone,
        });
        //Deploy site to s3
        new deploy.BucketDeployment(this, "Deployment", {
            sources: [deploy.Source.asset("./build")],
            destinationBucket: siteBucket,
            distribution: siteDistribution,
            distributionPaths: ["/*"],
        });
    }
}
exports.Stack = Stack;
