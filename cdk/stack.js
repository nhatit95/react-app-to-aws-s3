"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const route53 = require("@aws-cdk/aws-route53");
const acm = require("@aws-cdk/aws-certificatemanager");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const targets = require("@aws-cdk/aws-route53-targets");
const deploy = require("@aws-cdk/aws-s3-deployment");
const WEB_APP_DOMAIN = "reactapp.nhatnguyenit.com";
class Stack extends cdk.Stack {
    constructor(scope, id) {
        super(scope, id, {
            env: {
                account: "230638288020",
                region: "ap-southeast-1",
            },
        });
        //Get the Hosted Zone in the current account/region based on query parameters
        const hostedZone = route53.HostedZone.fromLookup(this, "Zone", {
            domainName: "nhatnguyenit.com",
        });
        //Create S3 Bucket for uploading react website (build folder)
        const siteBucket = new s3.Bucket(this, "SiteBucket", {
            bucketName: WEB_APP_DOMAIN,
            websiteIndexDocument: "index.html",
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        //Create certificate (SSL/TLS for domain)
        const siteCertificateArn = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
            domainName: WEB_APP_DOMAIN,
            hostedZone,
            region: "us-east-1", //standard for acm certs to work with CloudFront Distribution
        }).certificateArn;
        //Create CloudFront Distribution CDN - Content delivery network
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
        //Create A record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: WEB_APP_DOMAIN,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
            zone: hostedZone,
        });
        //Deploy site to S3
        new deploy.BucketDeployment(this, "Deployment", {
            sources: [deploy.Source.asset("./build")],
            destinationBucket: siteBucket,
            distribution: siteDistribution,
            distributionPaths: ["/*"],
        });
    }
}
exports.Stack = Stack;
